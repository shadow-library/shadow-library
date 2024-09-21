/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export enum ErrorType {
  CLIENT_ERROR = 'CLIENT_ERROR',
  HTTP_ERROR = 'HTTP_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CONFLICT = 'CONFLICT',
}

/**
 * Declaring the constants
 */

export class ErrorCode {
  protected constructor(
    private readonly code: string,
    private readonly type: ErrorType,
    private readonly msg: string,
  ) {}

  getCode(): string {
    return this.code;
  }

  getType(): ErrorType {
    return this.type;
  }

  getMessage(): string {
    return this.msg;
  }

  /** Unknown Error */
  static readonly UNKNOWN = new ErrorCode('UNKNOWN', ErrorType.SERVER_ERROR, 'Unknown Error');
  /** Unexpected Error */
  static readonly UNEXPECTED = new ErrorCode('UNEXPECTED', ErrorType.SERVER_ERROR, 'Unexpected Error');
  /** Validation Error */
  static readonly VALIDATION_ERROR = new ErrorCode('VALIDATION_ERROR', ErrorType.VALIDATION_ERROR, 'Validation Error');
}
