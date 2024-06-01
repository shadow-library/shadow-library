/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { AppError, ErrorCode, ErrorType } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('AppError', () => {
  let appError: AppError;

  it('should create an instance of AppError', () => {
    appError = new AppError(ErrorCode.S002);
    expect(appError.name).toBe('AppError');
    expect(appError).toBeInstanceOf(AppError);
  });

  it('should return the error type', () => {
    expect(appError.getType()).toBe(ErrorType.NOT_FOUND);
  });

  it('should return the error code', () => {
    expect(appError.getCode()).toBe('S002');
  });

  it('should return the error message', () => {
    expect(appError.getMessage()).toBe('Not Found');
  });

  it('should return the status code', () => {
    expect(appError.getStatusCode()).toBe(404);
  });
});
