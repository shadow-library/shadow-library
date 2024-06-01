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

/**
 * Declaring the constants
 */

export class AppError extends Error {
  constructor(private readonly error: ErrorCode) {
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

  getStatusCode(): number {
    return this.error.getStatusCode();
  }
}
