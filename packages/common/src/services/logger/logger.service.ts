/**
 * Importing npm packages
 */
import fs from 'fs';

import { InternalError } from '@shadow-library/errors';
import { Logger as WinstonLogger, createLogger as createWinstonLogger, format, transports } from 'winston';

/**
 * Importing user defined packages
 */

import { CloudWatchTransport } from './cloudwatch.logger';
import { additionalDataFormat, consoleFormat } from './formats.logger';
import { Config } from '../config.service';

/**
 * Defining types
 */

export enum LogTransport {
  Console,
  File,
  CloudWatch,
}

export interface LoggerOptions {
  transports?: LogTransport[];
  getContext?: () => Record<string, any>;
}

/**
 * Declaring the constants
 */
const logColorFormat = { info: 'green', error: 'bold red', warn: 'yellow', debug: 'magenta', http: 'cyan' };

/**
 * Gets the index or number of the log file
 * @param filename
 * @returns
 */
function getFileIndex(filename: string): number {
  const filenameArr = filename.split(/[-.]/);
  const num = filenameArr[filenameArr.length - 2] || '0';
  return parseInt(num);
}

export class Logger {
  private static instance: WinstonLogger;

  private constructor() {}

  static getLogger(label: string): Logger {
    if (this.instance) return this.instance.child({ label });
    return new Logger();
  }

  static initInstance(opts: LoggerOptions = {}): void {
    if (this.instance) throw new InternalError('Logger instance already initialized');

    if (!opts.getContext) opts.getContext = () => ({});
    if (!opts.transports) {
      opts.transports = [];
      const enableFileLog = Config.get('log.dir') !== 'false' && Config.get('app.env') !== 'test';
      const isTestDebug = Config.get('app.env') === 'test' && !!process.env.TEST_DEBUG;
      if (Config.get('app.env') === 'development') opts.transports.push(LogTransport.Console);
      if (Config.get('app.env') === 'production') opts.transports.push(LogTransport.CloudWatch);
      if (enableFileLog || isTestDebug) opts.transports.push(LogTransport.File);
    }

    const contextFormat = additionalDataFormat(opts.getContext);
    const logFormat = format.combine(contextFormat(), format.errors({ stack: true }), format.json());
    this.instance = createWinstonLogger({ level: Config.get('log.level') });

    /** Setting up the logger transports */
    if (opts.transports.includes(LogTransport.Console)) {
      const consoleColor = format.colorize({ level: true, colors: logColorFormat, message: true });
      const uppercaseLevel = format(info => ({ ...info, level: info.level.toUpperCase() }));
      const consoleLogFormat = format.combine(format.errors({ stack: true }), uppercaseLevel(), consoleColor, consoleFormat);
      this.instance.add(new transports.Console({ format: consoleLogFormat }));
    }
    if (opts.transports.includes(LogTransport.CloudWatch)) this.instance.add(new CloudWatchTransport({ format: logFormat }));
    if (opts.transports.includes(LogTransport.File)) {
      const logDir = Config.get('log.dir');
      try {
        fs.accessSync(logDir);
      } catch (err) {
        fs.mkdirSync(logDir);
      }

      /** Changing the name of the old files so that the file '<app-name>-0.log' always contains the latest logs */
      const appName = Config.get('app.name');
      const logFiles = fs.readdirSync(logDir);
      const regex = new RegExp(`^(${appName}-)[0-9]+(.log)$`);
      const appLogFiles = logFiles.filter(filename => regex.test(filename));
      const sortedFilenames = appLogFiles.sort((a, b) => getFileIndex(b) - getFileIndex(a));
      for (const filename of sortedFilenames) {
        const num = getFileIndex(filename);
        fs.renameSync(`${logDir}/${filename}`, `${logDir}/${appName}-${num + 1}.log`);
      }

      this.instance.add(new transports.File({ format: logFormat, filename: `${logDir}/${appName}-0.log` }));
    }
  }

  /** Mutates the input object to remove the sensitive fields that are present in it */
  static removeSensitiveFields(data: Record<string, any>, sensitiveFields: string[]): Record<string, any> {
    for (const key in data) {
      const value = data[key];
      if (sensitiveFields.includes(key)) data[key] = 'xxxx';
      else if (typeof value === 'object' && !Array.isArray(value)) this.removeSensitiveFields(value, sensitiveFields);
    }
    return data;
  }

  debug(message: string, ...meta: any[]): this;
  debug(infoObject: object): this;
  debug(message: any): this; // eslint-disable-line  @typescript-eslint/explicit-module-boundary-types
  debug(): this {
    return this;
  }

  info(message: string, ...meta: any[]): this;
  info(infoObject: object): this;
  info(message: any): this; // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  info(): this {
    return this;
  }

  http(message: string, ...meta: any[]): this;
  http(infoObject: object): this;
  http(message: any): this; // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  http(): this {
    return this;
  }

  warn(message: string, ...meta: any[]): this;
  warn(infoObject: object): this;
  warn(message: any): this; // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  warn(): this {
    return this;
  }

  error(message: string, ...meta: any[]): this;
  error(infoObject: object): this;
  error(message: any): this; // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  error(): this {
    return this;
  }
}
