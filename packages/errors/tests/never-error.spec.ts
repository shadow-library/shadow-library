/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { NeverError } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const msg = 'Error that should not happen';

describe('NeverError', () => {
  let neverError: NeverError;

  it('should create an instance of NeverError', () => {
    neverError = new NeverError(msg);
    expect(neverError).toBeInstanceOf(Error);
    expect(neverError).toBeInstanceOf(NeverError);
    expect(neverError.name).toBe(NeverError.name);
  });

  it('should return the error message', () => {
    expect(neverError.getMessage()).toBe(msg);
  });
});
