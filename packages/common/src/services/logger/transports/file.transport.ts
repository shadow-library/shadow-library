/**
 * Importing npm packages
 */
import fs from 'fs';

import { Logform, format, transports } from 'winston';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface FileTransportOptions {
  dirname: string;
  filename: string;
}

/**
 * Declaring the constants
 */

/* istanbul ignore next */
export class FileTransport extends transports.File {
  constructor(options: FileTransportOptions) {
    FileTransport.rotateLogFiles(options.dirname, options.filename);
    const filename = `${options.dirname}/${options.filename}-0.log`;
    super({ filename });
  }

  private static getFileIndex(filename: string): number {
    const filenameArr = filename.split(/[-.]/);
    const num = filenameArr[filenameArr.length - 2] ?? '0';
    return parseInt(num);
  }

  private static rotateLogFiles(dirname: string, filename: string): void {
    try {
      fs.accessSync(dirname);
    } catch (err) {
      fs.mkdirSync(dirname);
    }

    const logFiles = fs.readdirSync(dirname);
    const regex = new RegExp(`^(${filename}-)[0-9]+(.log)$`);
    const appLogFiles = logFiles.filter(filename => regex.test(filename));
    const sortedFilenames = appLogFiles.sort((a, b) => this.getFileIndex(b) - this.getFileIndex(a));
    for (const olFilename of sortedFilenames) {
      const num = this.getFileIndex(olFilename);
      fs.renameSync(`${dirname}/${olFilename}`, `${dirname}/${filename}-${num + 1}.log`);
    }
  }

  addFormat(...formats: Logform.Format[]): this {
    const newFormats = this.format ? [this.format, ...formats] : formats;
    this.format = format.combine(...newFormats);
    return this;
  }
}
