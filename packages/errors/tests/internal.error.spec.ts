/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ErrorCode, InternalError } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const maskedErrorMessage = 'Internal Masked Error';
const internalErrorMessage = 'Internal Unmasked Error';

describe('InternalError', () => {
  let maskedError: InternalError;
  let internalError: InternalError;

  it('should create an instance of InternalError', () => {
    maskedError = new InternalError(ErrorCode.UNEXPECTED, maskedErrorMessage);
    internalError = new InternalError(internalErrorMessage);
    expect(maskedError).toBeInstanceOf(InternalError);
    expect(internalError).toBeInstanceOf(InternalError);
  });

  it('should return the public error code', () => {
    expect(maskedError.getPublicErrorCode()).toBe(ErrorCode.UNEXPECTED);
    expect(internalError.getPublicErrorCode()).toBe(ErrorCode.UNKNOWN);
  });

  it('should return the error message', () => {
    expect(maskedError.getMessage()).toBe(maskedErrorMessage);
    expect(internalError.getMessage()).toBe(internalErrorMessage);
  });
});
