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
  it('should create an instance of AppError', () => {
    const error = new AppError(ErrorCode.UNKNOWN);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(AppError);
  });

  it('should return the error type', () => {
    const errorOne = new AppError(ErrorCode.UNKNOWN);
    const erroTwo = new AppError(ErrorCode.VALIDATION_ERROR);

    expect(errorOne.getType()).toBe(ErrorType.SERVER_ERROR);
    expect(erroTwo.getType()).toBe(ErrorType.VALIDATION_ERROR);
  });

  it('should return the error code', () => {
    const errorOne = new AppError(ErrorCode.UNKNOWN);
    const errorTwo = new AppError(ErrorCode.VALIDATION_ERROR);

    expect(errorOne.getCode()).toBe('UNKNOWN');
    expect(errorTwo.getCode()).toBe('VALIDATION_ERROR');
  });

  it('should return the error message', () => {
    /* @ts-expect-error private contructor access */
    const customErrorCode = new ErrorCode('CUSTOM_ERROR', ErrorType.SERVER_ERROR, 'Custom error: {message}');
    const errorOne = new AppError(ErrorCode.UNKNOWN);
    const errorTwo = new AppError(customErrorCode, { message: 'unauthorized' });

    expect(errorOne.getMessage()).toBe('Unknown Error');
    expect(errorTwo.getMessage()).toBe('Custom error: unauthorized');
  });

  it('should return the error data', () => {
    const data = { message: 'Custom Error Message' };
    const errorOne = new AppError(ErrorCode.UNKNOWN, data);
    const errorTwo = new AppError(ErrorCode.VALIDATION_ERROR);

    expect(errorOne.getData()).toBe(data);
    expect(errorTwo.getData()).toBeUndefined();
  });

  it('should return the error object', () => {
    const errorOne = new AppError(ErrorCode.UNKNOWN);
    const errorTwo = new AppError(ErrorCode.VALIDATION_ERROR);

    expect(errorOne.toObject()).toStrictEqual({ code: 'UNKNOWN', type: 'SERVER_ERROR', message: 'Unknown Error' });
    expect(errorTwo.toObject()).toStrictEqual({ code: 'VALIDATION_ERROR', type: 'VALIDATION_ERROR', message: 'Validation Error' });
  });
});
