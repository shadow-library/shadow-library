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

describe('String Utils', () => {
  describe('interpolate', () => {
    it('should interpolate the string with the object', () => {
      expect(utils.string.interpolate('Hello {name}', { name: 'World' })).toBe('Hello World');
    });

    it('should convert the value to string if it is not a string', () => {
      expect(utils.string.interpolate('Hello {name}', { name: 123 })).toBe('Hello 123');
    });

    it('should return the string as it is if the key is not present in the object', () => {
      expect(utils.string.interpolate('Hello {name}', {})).toBe('Hello {name}');
    });

    it('should escape the curly braces if it is prefixed with a backslash', () => {
      expect(utils.string.interpolate('Hello \\{name}', { name: 'World' })).toBe('Hello {name}');
    });
  });
});
