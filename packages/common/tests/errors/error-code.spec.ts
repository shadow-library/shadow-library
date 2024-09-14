/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ErrorCode, ErrorType } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ErrorCode', () => {
  const errorCode = ErrorCode.UNKNOWN;

  it('should return the error type', () => {
    expect(errorCode.getType()).toBe(ErrorType.SERVER_ERROR);
  });

  it('should return the error code', () => {
    expect(errorCode.getCode()).toBe('UNKNOWN');
  });

  it('should return the error message', () => {
    expect(errorCode.getMessage()).toBe('Unknown Error');
  });

  it('should return the status code', () => {
    expect(errorCode.getStatusCode()).toBe(500);
  });
});
