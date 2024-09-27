/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ErrorCode, InternalError } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('InternalError', () => {
  const maskedErrorMessage = 'Internal Masked Error';
  const internalErrorMessage = 'Internal Unmasked Error';

  it('should create an instance of InternalError', () => {
    const maskedError = new InternalError(ErrorCode.UNEXPECTED, maskedErrorMessage);
    const internalError = new InternalError(internalErrorMessage);

    expect(maskedError).toBeInstanceOf(InternalError);
    expect(internalError).toBeInstanceOf(InternalError);
  });

  it('should return the public error code', () => {
    const maskedError = new InternalError(ErrorCode.UNEXPECTED, maskedErrorMessage);
    const internalError = new InternalError(internalErrorMessage);

    expect(maskedError.getPublicErrorCode()).toBe(ErrorCode.UNEXPECTED);
    expect(internalError.getPublicErrorCode()).toBe(ErrorCode.UNKNOWN);
  });

  it('should return the error message', () => {
    const maskedError = new InternalError(ErrorCode.UNEXPECTED, maskedErrorMessage);
    const internalError = new InternalError(internalErrorMessage);

    expect(maskedError.getMessage()).toBe(maskedErrorMessage);
    expect(internalError.getMessage()).toBe(internalErrorMessage);
  });
});
