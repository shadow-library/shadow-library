/**
 * Importing npm packages
 */
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
  private getInstance(): WinstonLogger {
    return logger;
  }

  /** Mutates the input object to remove the sensitive fields that are present in it */
  maskFields(data: Record<string, any>, fields: string[]): Record<string, any> {
    for (const key in data) {
      const value = data[key];
      if (fields.includes(key)) data[key] = '****';
      else if (typeof value === 'object') this.maskFields(value, fields);
    }
    return data;
  }

  /** Adds a transport to the logger */
  addTransport(transport: Transport): this {
    logger.add(transport);
    return this;
  }

  /** Returns a child logger with the provided metadata */
  getLogger(metadata: string | object): Logger {
    if (logger.transports.length === 0) this.addTransport(noop);
    return logger.child(metadata);
  }

  /* istanbul ignore next */
  addDefaultTransports(format?: Logform.Format): this {
    const baseFormats = [formats.errors({ stack: true })];
    if (format) baseFormats.unshift(format);
    const jsonFormat = formats.combine(...baseFormats, formats.json());
    const consoleFormat = formats.combine(...baseFormats, formats.colorize(), formats.brief());

    if (Config.get('app.env') === 'development') {
      const transport = new ConsoleTransport().addFormat(consoleFormat);
      this.addTransport(transport);
    }

    if (Config.get('app.env') === 'production') {
      const transport = new CloudWatchTransport().addFormat(jsonFormat);
      this.addTransport(transport);
    }

    const enableFileLog = Config.get('log.dir') !== 'false' && Config.get('app.env') !== 'test';
    const isTestDebug = Config.get('app.env') === 'test' && !!process.env.TEST_DEBUG;
    if (enableFileLog || isTestDebug) {
      const dirname = Config.get('log.dir');
      const filename = Config.get('app.name');
      const transport = new FileTransport({ dirname, filename }).addFormat(jsonFormat);
      this.addTransport(transport);
    }

    return this;
  }
}

export const Logger = new LoggerStatic();
