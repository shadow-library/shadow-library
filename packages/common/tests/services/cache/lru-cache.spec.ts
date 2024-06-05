/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { LRUCache } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('LRU Cache', () => {
  let cache: LRUCache;

  describe('init', () => {
    it('should throw an error if the capacity is less than or equal to 0', () => {
      const error = new InternalError('Cache capacity must be a positive number greater than 0');
      expect(() => new LRUCache(0)).toThrow(error);
    });

    it('should throw an error if the capacity is more than the maximum limit', () => {
      const error = new InternalError('Cache capacity must be less than 4294967295');
      expect(() => new LRUCache(4294967297)).toThrow(error);
    });

    it('should initialize the cache with the given capacity', () => {
      cache = new LRUCache(3);
      expect(cache).toBeInstanceOf(LRUCache);
    });
  });

  describe('set', () => {
    it('should set the value for the given key', () => {
      cache.set('key-str', 'value');
      const value = cache.get('key-str');
      expect(value).toBe('value');
    });

    it('should update the value for the given key', () => {
      cache.set('key-str', 'updated-value');
      const value = cache.get('key-str');
      expect(value).toBe('updated-value');
    });

    it('should set the number value for the given key', () => {
      cache.set('key-num', 123);
      const value = cache.get('key-num');
      expect(value).toBe(123);
    });

    it('should set the object value for the given key', () => {
      cache.set('key-obj', { key: 'value' });
      const value = cache.get('key-obj');
      expect(value).toEqual({ key: 'value' });
    });

    it('should set when value is null', () => {
      cache.set('key-null', null);
      const value = cache.get('key-null');
      expect(value).toBeNull();
    });

    it('should delete the least recently used key if the capacity is full', () => {
      const value = cache.get('key-str');
      expect(value).toBeUndefined();
    });
  });

  describe('peek', () => {
    it('should return the value for the given key', () => {
      const value = cache.peek('key-num');
      expect(value).not.toBeUndefined();
    });

    it('should return undefined for the least recently accessed key', () => {
      cache.set('key-str', 'value');
      const value = cache.peek('key-num');
      expect(value).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should return the value for the given key', () => {
      const value = cache.get('key-obj');
      expect(value).not.toBeUndefined();
    });

    it('should return undefined if the key is not found', () => {
      const value = cache.get('key-undefined');
      expect(value).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true if the key is found', () => {
      const value = cache.has('key-obj');
      expect(value).toBe(true);
    });

    it('should return false if the key is not found', () => {
      const value = cache.has('key-undefined');
      expect(value).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete the value for the given key and return its value', () => {
      const deletedValue = cache.remove('key-obj');
      const value = cache.get('key-obj');
      expect(deletedValue).not.toBeUndefined();
      expect(value).toBeUndefined();
    });

    it('should return undefined for not found key', () => {
      const deletedValue = cache.remove('key-undefined');
      expect(deletedValue).toBeUndefined();
    });
  });
});
