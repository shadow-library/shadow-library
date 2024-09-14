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

export class ErrorCode {
  private readonly statusCode: number;

  protected constructor(
    private readonly code: string,
    private readonly type: ErrorType,
    private readonly msg: string,
    statusCode?: number,
  ) {
    this.statusCode = statusCode || ERROR_STATUS_CODES[type];
  }

  getCode(): string {
    return this.code;
  }

  getType(): ErrorType {
    return this.type;
  }

  getMessage(): string {
    return this.msg;
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  /** Unknown Error */
  static readonly UNKNOWN = new ErrorCode('UNKNOWN', ErrorType.SERVER_ERROR, 'Unknown Error');
  /** Unexpected Error */
  static readonly UNEXPECTED = new ErrorCode('UNEXPECTED', ErrorType.SERVER_ERROR, 'Unexpected Error');
}
