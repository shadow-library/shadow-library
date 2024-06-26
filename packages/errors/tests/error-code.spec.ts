/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ErrorCode, ErrorType } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ErrorCode', () => {
  const errorCode = ErrorCode.S002;

  it('should return the error type', () => {
    expect(errorCode.getType()).toBe(ErrorType.NOT_FOUND);
  });

  it('should return the error code', () => {
    expect(errorCode.getCode()).toBe('S002');
  });

  it('should return the error message', () => {
    expect(errorCode.getMessage()).toBe('Not Found');
  });

  it('should return the status code', () => {
    expect(errorCode.getStatusCode()).toBe(404);
  });
});
