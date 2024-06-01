/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { InternalError, ErrorCode } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('InternalError', () => {
  let interalError: InternalError;

  it('should create an instance of InternalError', () => {
    interalError = new InternalError(ErrorCode.S002, 'Internal Error');
    expect(interalError).toBeInstanceOf(InternalError);
  });

  it('should return the public error code', () => {
    expect(interalError.getPublicErrorCode()).toBe(ErrorCode.S002);
  });

  it('should return the error message', () => {
    expect(interalError.getMessage()).toBe('Internal Error');
  });
});
