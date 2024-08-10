/**
 * Importing npm packages
 */
import { AppError, ErrorCode, ErrorType } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ServerError extends AppError {}

export class ServerErrorCode extends ErrorCode {
  /*!
   * List of all server related errors
   */

  /** Unexpected server error */
  static readonly S001 = new ErrorCode('S001', ErrorType.SERVER_ERROR, 'Unexpected Server Error');
  /** Not found */
  static readonly S002 = new ErrorCode('S002', ErrorType.NOT_FOUND, 'Not Found');
  /** Invalid input */
  static readonly S003 = new ErrorCode('S003', ErrorType.VALIDATION_ERROR, 'Invalid Input');
  /** Request body is too large */
  static readonly S004 = new ErrorCode('S004', ErrorType.SERVER_ERROR, 'Request body is too large');
  /** Request body size did not match Content-Length */
  static readonly S005 = new ErrorCode('S005', ErrorType.SERVER_ERROR, 'Request body size did not match Content-Length');
  /** Body cannot be empty when content-type is set to 'application/json' */
  static readonly S006 = new ErrorCode('S006', ErrorType.SERVER_ERROR, "Body cannot be empty when content-type is set to 'application/json'");
}
