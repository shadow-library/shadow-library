/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { throwError } from '@shadow-library/common/shorthands';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Shorthands', () => {
  describe('throwError', () => {
    it('should throw an error', () => {
      const error = new Error('Test error');
      expect(() => throwError(error)).toThrowError(error);
    });
  });
});
