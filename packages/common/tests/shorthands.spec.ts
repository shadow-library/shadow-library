/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { throwError, tryCatch } from '@shadow-library/common/shorthands';

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

  describe('tryCatch', () => {
    it('should return the result of the function', () => {
      const result = tryCatch(() => 'success');
      expect(result).toStrictEqual({ success: true, data: 'success' });
    });

    it('should return the result of the promise', async () => {
      const result = await tryCatch(() => new Promise(resolve => setTimeout(() => resolve('success'), 10)));
      expect(result).toStrictEqual({ success: true, data: 'success' });
    });

    it('should return the error if the function throws an error', () => {
      const error = new Error('Test error');
      const result = tryCatch(() => throwError(error));
      expect(result).toStrictEqual({ success: false, error });
    });

    it('should return the error if the promise rejects', async () => {
      const error = new Error('Test error');
      const result = await tryCatch(() => new Promise((_, reject) => setTimeout(() => reject(error), 10)));
      expect(result).toStrictEqual({ success: false, error });
    });
  });
});
