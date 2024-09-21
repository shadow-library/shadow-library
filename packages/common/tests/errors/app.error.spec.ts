/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { AppError, ErrorCode, ErrorType } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('AppError', () => {
  let appError: AppError;

  it('should create an instance of AppError', () => {
    appError = new AppError(ErrorCode.UNKNOWN);
    expect(appError.name).toBe('AppError');
    expect(appError).toBeInstanceOf(AppError);
  });

  it('should return the error type', () => {
    expect(appError.getType()).toBe(ErrorType.SERVER_ERROR);
  });

  it('should return the error code', () => {
    expect(appError.getCode()).toBe('UNKNOWN');
  });

  it('should return the error message', () => {
    expect(appError.getMessage()).toBe('Unknown Error');
  });

  it('should return the error object', () => {
    expect(appError.toObject()).toStrictEqual({ code: 'UNKNOWN', type: 'SERVER_ERROR', message: 'Unknown Error' });
  });
});
