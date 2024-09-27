/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { InMemoryStore, InternalError } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  describe('get()', () => {
    it('should return undefined if the key does not exist', () => {
      expect(store.get('non-existent-key')).toBeUndefined();
    });

    it('should return default value if the key does not exist and a default is provided', () => {
      expect(store.get('non-existent-key', 'default')).toBe('default');
    });

    it('should return the stored value if the key exists', () => {
      store.set('key', 'value');
      expect(store.get('key')).toBe('value');
    });
  });

  describe('set()', () => {
    it('should store a value by key', () => {
      store.set('key', 'value');
      expect(store.get('key')).toBe('value');
    });

    it('should return the InMemoryStore instance for chaining', () => {
      expect(store.set('key', 'value')).toBeInstanceOf(InMemoryStore);
    });
  });

  describe('del()', () => {
    it('should delete a key from the store', () => {
      store.set('key', 'value');
      store.del('key');
      expect(store.get('key')).toBeUndefined();
    });

    it('should return the InMemoryStore instance for chaining', () => {
      expect(store.del('key')).toBeInstanceOf(InMemoryStore);
    });
  });

  describe('insert()', () => {
    it('should insert a value into an array if the key exists and contains an array', () => {
      store.set('key', [1, 2]);
      store.insert('key', 3);
      expect(store.get('key')).toEqual([1, 2, 3]);
    });

    it('should create a new array if the key does not exist', () => {
      store.insert('key', 1);
      expect(store.get('key')).toEqual([1]);
    });

    it('should throw an error if the existing value is not an array', () => {
      store.set('key', 'not-an-array');
      expect(() => store.insert('key', 1)).toThrowError(InternalError);
    });
  });

  describe('remove()', () => {
    it('should remove a value from an array if the key exists and contains an array', () => {
      store.set('key', [1, 2, 3]);
      store.remove('key', 2);
      expect(store.get('key')).toEqual([1, 3]);
    });

    it('should do nothing if the key does not exist', () => {
      store.remove('key', 1);
      expect(store.get('key')).toBeUndefined();
    });

    it('should throw an error if the existing value is not an array', () => {
      store.set('key', 'not-an-array');
      expect(() => store.remove('key', 1)).toThrowError(InternalError);
    });
  });

  describe('inc()', () => {
    it('should increment the value of the key by the provided value', () => {
      store.set('counter', 5);
      const result = store.inc('counter', 3);
      expect(result).toBe(8);
      expect(store.get('counter')).toBe(8);
    });

    it('should initialize the key to 0 if it does not exist and increment from there', () => {
      const result = store.inc('counter', 5);
      expect(result).toBe(5);
      expect(store.get('counter')).toBe(5);
    });

    it('should throw an error if the value is not a number', () => {
      store.set('counter', 'not-a-number');
      expect(() => store.inc('counter', 5)).toThrowError(InternalError);
    });
  });

  describe('getOptionalArray()', () => {
    it('should return undefined if the key does not exist', () => {
      expect(store['getOptionalArray']('non-existent-key')).toBeUndefined();
    });

    it('should throw an error if the value is not an array', () => {
      store.set('key', 'not-an-array');
      expect(() => (store as any).getOptionalArray('key')).toThrowError(InternalError);
    });
  });
});
