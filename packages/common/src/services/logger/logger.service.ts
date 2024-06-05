/**
 * Importing npm packages
 */
import fs from 'fs';

import { type Logger as WinstonLogger, createLogger as createWinstonLogger, format, transports } from 'winston';

/**
 * Importing user defined packages
 */

import { CloudWatchTransport } from './cloudwatch.logger';
import { additionalDataFormat, consoleFormat } from './formats.logger';
import { Config } from '../config.service';

/**
 * Defining types
 */

export type Logger = WinstonLogger;

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

export class LoggerService {
  private static instance: WinstonLogger;

  static getInstance(fn: () => Record<string, any> = () => ({})): WinstonLogger {
    if (this.instance) return this.instance;

    const nodeEnv = Config.get('app.env');
    const logDir = Config.get('log.dir');
    const contextFormat = additionalDataFormat(fn);
    const logFormat = format.combine(contextFormat(), format.errors({ stack: true }), format.json());
    this.instance = createWinstonLogger({ level: Config.get('log.level') });

    /** Logger setup for development mode */
    if (nodeEnv === 'development') {
      const consoleColor = format.colorize({ level: true, colors: logColorFormat, message: true });
      const uppercaseLevel = format(info => ({ ...info, level: info.level.toUpperCase() }));
      const consoleLogFormat = format.combine(format.errors({ stack: true }), uppercaseLevel(), consoleColor, consoleFormat);
      this.instance.add(new transports.Console({ format: consoleLogFormat }));
    }

    if (nodeEnv === 'production') this.instance.add(new CloudWatchTransport({ format: logFormat }));
    else if (logDir !== 'false') {
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

    return this.instance;
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
}
