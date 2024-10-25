/**
 * Importing npm packages
 */
import fastRedact from 'fast-redact';
import { Logform, Logger as WinstonLogger, createLogger } from 'winston';
import Transport from 'winston-transport';

/**
 * Importing user defined packages
 */
import { format as formats } from './formats';
import { CloudWatchTransport, ConsoleTransport, FileTransport } from './transports';
import { Config } from '../config.service';

/**
 * Defining types
 */

export type redactFn = <T>(input: T) => string | T;

export interface Logger {
  verbose(message: string, ...meta: any[]): void;
  debug(message: string, ...meta: any[]): void;
  info(message: string, ...meta: any[]): void;
  http(message: string, ...meta: any[]): void;
  warn(message: string, ...meta: any[]): void;
  error(message: string, ...meta: any[]): void;
}

/**
 * Declaring the constants
 */
/* istanbul ignore next */
const noop = new Transport({ log: () => {} });
const logger = createLogger({ level: Config.get('log.level') });

class LoggerStatic {
  /** Returns the logger instance */
  private getInstance(): WinstonLogger {
    return logger;
  }

  /** Creates a redactor to remove sensitive fields. This mutates the original value. If no censor is given, the field is removed */
  getRedactor(paths: string[], censor: string | ((value: any) => any) = 'xxxx'): redactFn {
    return fastRedact({ paths, serialize: false, censor });
  }

  /** Adds a transport to the logger */
  addTransport(transport: Transport): this {
    const index = logger.transports.findIndex(t => t === noop);
    if (index >= 0) logger.remove(noop);
    logger.add(transport);
    return this;
  }

  /** Returns a child logger with the provided metadata */
  getLogger(metadata: string | object): Logger {
    if (logger.transports.length === 0) this.addTransport(noop);
    return logger.child(typeof metadata === 'string' ? { label: metadata } : metadata);
  }

  /* istanbul ignore next */
  addDefaultTransports(format?: Logform.Format): this {
    const env = Config.get('app.env');
    const baseFormats = [formats.errors({ stack: true })];
    if (format) baseFormats.unshift(format);

    if (env === 'development') {
      const format = formats.combine(...baseFormats, formats.colorize(), formats.brief());
      const transport = new ConsoleTransport().addFormat(format);
      this.addTransport(transport);
    }

    if (env === 'production') {
      const format = formats.combine(...baseFormats);
      const transport = new CloudWatchTransport().addFormat(format);
      this.addTransport(transport);
    }

    const enableFileLog = Config.get('log.dir') !== 'false' && env === 'development';
    const isTestDebug = env === 'test' && !!process.env.TEST_DEBUG;
    if (enableFileLog || isTestDebug) {
      const dirname = Config.get('log.dir');
      const filename = Config.get('app.name');
      const format = formats.combine(...baseFormats, formats.json());
      const transport = new FileTransport({ dirname, filename }).addFormat(format);
      this.addTransport(transport);
    }

    return this;
  }
}

export const Logger = new LoggerStatic();
