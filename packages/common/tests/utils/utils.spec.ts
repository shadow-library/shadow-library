/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { utils } from '@shadow-library/common/utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Utils', () => {
  describe('isValid', () => {
    it('should return false for undefined', () => {
      expect(utils.isValid(undefined)).toBe(false);
    });

    it('should return false for null', () => {
      expect(utils.isValid(null)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(utils.isValid('')).toBe(false);
    });

    it('should return false for whitespace string', () => {
      expect(utils.isValid('   ')).toBe(false);
    });

    it('should return true for non-empty string', () => {
      expect(utils.isValid('John Doe')).toBe(true);
    });

    it('should return false for NaN', () => {
      expect(utils.isValid(NaN)).toBe(false);
    });

    it('should return true for number', () => {
      expect(utils.isValid(123)).toBe(true);
    });
  });
});
