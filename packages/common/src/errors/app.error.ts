/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { utils } from '../utils';
import { type ErrorCode, type ErrorType } from './error-code.error';

/**
 * Defining types
 */

export interface AppErrorObject {
  code: string;
  type: ErrorType;
  message: string;
}

/**
 * Declaring the constants
 */

export class AppError<TErrorCode extends ErrorCode = ErrorCode> extends Error {
  constructor(
    protected readonly error: TErrorCode,
    protected readonly data?: Record<string, any>,
  ) {
    let message = error.getMessage();
    if (data) message = utils.string.interpolate(message, data);
    super(message);
    this.name = this.constructor.name;
  }

  getCause(): Error | undefined {
    return this.cause as Error;
  }

  setCause(cause: Error): this {
    this.cause = cause;
    return this;
  }

  getType(): ErrorType {
    return this.error.getType();
  }

  getCode(): string {
    return this.error.getCode();
  }

  getMessage(): string {
    return this.message;
  }

  getData(): Record<string, any> | undefined {
    return this.data;
  }

  toObject(): AppErrorObject {
    return { code: this.getCode(), type: this.getType(), message: this.getMessage() };
  }
}
