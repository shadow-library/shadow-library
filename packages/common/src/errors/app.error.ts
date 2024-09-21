/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
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
  constructor(protected readonly error: TErrorCode) {
    super(error.getMessage());
    this.name = this.constructor.name;
  }

  getType(): ErrorType {
    return this.error.getType();
  }

  getCode(): string {
    return this.error.getCode();
  }

  getMessage(): string {
    return this.error.getMessage();
  }

  toObject(): AppErrorObject {
    return { code: this.getCode(), type: this.getType(), message: this.getMessage() };
  }
}
