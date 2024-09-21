/**
 * Importing npm packages
 */
import { AppError, ErrorCode, ErrorType } from '@shadow-library/common';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const ERROR_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.CLIENT_ERROR]: 400,
  [ErrorType.HTTP_ERROR]: 400,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.SERVER_ERROR]: 500,
  [ErrorType.UNAUTHENTICATED]: 401,
  [ErrorType.UNAUTHORIZED]: 403,
  [ErrorType.VALIDATION_ERROR]: 422,
  [ErrorType.CONFLICT]: 409,
};

export class ServerError extends AppError<ServerErrorCode> {
  constructor(error: ServerErrorCode) {
    super(error);
  }

  getStatusCode(): number {
    return this.error.getStatusCode();
  }
}

export class ServerErrorCode extends ErrorCode {
  private readonly statusCode: number;

  constructor(code: string, type: ErrorType, msg: string, statusCode?: number) {
    super(code, type, msg);
    this.statusCode = statusCode ?? ERROR_STATUS_CODES[type];
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  /*!
   * List of all server related errors
   */

  /** Unexpected server error */
  static readonly S001 = new ServerErrorCode('S001', ErrorType.SERVER_ERROR, 'Unexpected Server Error');
  /** Not found */
  static readonly S002 = new ServerErrorCode('S002', ErrorType.NOT_FOUND, 'Not Found');
  /** Invalid input */
  static readonly S003 = new ServerErrorCode('S003', ErrorType.VALIDATION_ERROR, 'Invalid Input');
  /** Request body is too large */
  static readonly S004 = new ServerErrorCode('S004', ErrorType.SERVER_ERROR, 'Request body is too large');
  /** Request body size did not match Content-Length */
  static readonly S005 = new ServerErrorCode('S005', ErrorType.SERVER_ERROR, 'Request body size did not match Content-Length');
  /** Body cannot be empty when content-type is set to 'application/json' */
  static readonly S006 = new ServerErrorCode('S006', ErrorType.SERVER_ERROR, "Body cannot be empty when content-type is set to 'application/json'");
}
