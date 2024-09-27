/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { NeverError } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('NeverError', () => {
  const msg = 'Error that should not happen';

  it('should create an instance of NeverError', () => {
    const neverError = new NeverError(msg);
    expect(neverError).toBeInstanceOf(Error);
    expect(neverError).toBeInstanceOf(NeverError);
    expect(neverError.name).toBe(NeverError.name);
  });

  it('should return the error message', () => {
    const neverError = new NeverError(msg);
    expect(neverError.getMessage()).toBe(msg);
  });
});
