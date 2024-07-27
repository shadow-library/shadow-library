/**
 * Importing npm packages
 */
import { Logform, format, transports } from 'winston';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

/* istanbul ignore next */
export class ConsoleTransport extends transports.Console {
  constructor() {
    super();
  }

  addFormat(...formats: Logform.Format[]): this {
    const newFormats = this.format ? [this.format, ...formats] : formats;
    this.format = format.combine(...newFormats);
    return this;
  }

  colorize(): this {
    const colors = { info: 'green', error: 'bold red', warn: 'yellow', debug: 'magenta', http: 'cyan' };
    return this.addFormat(format.colorize({ all: true, colors }));
  }
}
