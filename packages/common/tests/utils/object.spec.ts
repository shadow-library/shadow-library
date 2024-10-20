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

describe('Object Utils', () => {
  describe('getByPath', () => {
    const data = {
      name: { first: 'John', last: 'Doe' },
      permissions: { db: { read: true, write: false } },
      sessions: [
        { id: 1, token: 'abc' },
        { id: 2, token: 'xyz' },
      ],
    };

    it('should return the value of the given path', () => {
      expect(utils.object.getByPath(data, 'name.first')).toBe('John');
      expect(utils.object.getByPath(data, 'permissions.db.read')).toBe(true);
    });

    it('should return the value of the given path for array', () => {
      expect(utils.object.getByPath(data, 'sessions.0.token')).toBe('abc');
      expect(utils.object.getByPath(data, 'sessions.1.token')).toBe('xyz');
    });

    it('should return undefined if the path is not found', () => {
      expect(utils.object.getByPath(data, 'name.middle')).toBeUndefined();
      expect(utils.object.getByPath(data, 'address.country')).toBeUndefined();
    });
  });

  describe('pickKeys', () => {
    it('should return a new object with the needed fields', () => {
      const data = { name: 'John Doe', age: 30, email: 'john-doe@email.com' };
      const result = utils.object.pickKeys(data, ['name', 'email']);

      expect(result).not.toBe(data);
      expect(result).toStrictEqual({ name: data.name, email: data.email });
    });
  });

  describe('omitKeys', () => {
    it('should return a new object after removing the unneeded keys', () => {
      const data = { name: 'John Doe', age: 30, email: 'john-doe@email.com' };
      const result = utils.object.omitKeys(data, ['age']);

      expect(result).not.toBe(data);
      expect(result).toStrictEqual({ name: data.name, email: data.email });
    });
  });
});
