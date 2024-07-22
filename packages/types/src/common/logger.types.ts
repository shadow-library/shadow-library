/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface LoggerService {
  verbose(message: string, ...meta: any[]): void;
  verbose(infoObject: object): void;
  verbose(message: any): void;

  debug(message: string, ...meta: any[]): void;
  debug(infoObject: object): void;
  debug(message: any): void;

  info(message: string, ...meta: any[]): void;
  info(infoObject: object): void;
  info(message: any): void;

  http(message: string, ...meta: any[]): void;
  http(infoObject: object): void;
  http(message: any): void;

  warn(message: string, ...meta: any[]): void;
  warn(infoObject: object): void;
  warn(message: any): void;

  error(message: string, ...meta: any[]): void;
  error(infoObject: object): void;
  error(message: any): void;
}
