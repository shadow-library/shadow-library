/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';
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
  describe('init', () => {
    it('should throw an error if the capacity is less than or equal to 0', () => {
      const error = new InternalError('Cache capacity must be a positive number greater than 0');
      expect(() => new LRUCache(0)).toThrow(error);
    });

    it('should throw an error if the capacity is more than the maximum limit', () => {
      const error = new InternalError('Cache capacity must be less than 4294967295');
      expect(() => new LRUCache(4294967297)).toThrow(error);
    });

    it('should initialize the cache with the correct typed array', () => {
      /** @ts-expect-error Accessing private method */
      const getTypedArray = LRUCache.getTypedArray;
      expect(getTypedArray(1)).toBe(Uint8Array);
      expect(getTypedArray(257)).toBe(Uint16Array);
      expect(getTypedArray(65537)).toBe(Uint32Array);
    });

    it('should initialize the cache with the given capacity', () => {
      const cache = new LRUCache(3);
      expect(cache).toBeInstanceOf(LRUCache);
    });
  });

  describe('set', () => {
    it('should set the value for the given key', () => {
      const cache = new LRUCache(1);
      const value = cache.set('key', 'value').get('key');
      expect(value).toBe('value');
    });

    it('should update the value for the given key', () => {
      const cache = new LRUCache(1);
      const value = cache.set('key', 'value').set('key', 'updated-value').get('key');
      expect(value).toBe('updated-value');
    });

    it('should set the number value for the given key', () => {
      const cache = new LRUCache(1);
      const value = cache.set('key', 123).get('key');
      expect(value).toBe(123);
    });

    it('should set the object value for the given key', () => {
      const obj = { key: 'value' };
      const cache = new LRUCache(1);
      const value = cache.set('key', obj).get('key');
      expect(value).toBe(obj);
    });

    it('should set when value is null', () => {
      const cache = new LRUCache(1);
      const value = cache.set('key', null).get('key');
      expect(value).toBeNull();
    });

    it('should delete the least recently used key if the capacity is full', () => {
      const cache = new LRUCache(2);
      const value = cache.set('key-1', 'value-1').set('key-2', 'value-2').set('key-3', 'value-3').get('key-1');
      expect(value).toBeUndefined();
    });

    it('should use the free space if the capacity is full', () => {
      const cache = new LRUCache(3);
      cache.set('key-1', 'value-1').set('key-2', 'value-2').set('key-3', 'value-3').remove('key-2');
      const value = cache.set('key-4', 'value-4').get('key-1');
      expect(value).toBe('value-1');
    });
  });

  describe('peek', () => {
    it('should return the value for the given key without updating least recently accessed list', () => {
      const cache = new LRUCache(2);
      const peekValue = cache.set('key-1', 'value-1').set('key-2', 'value-2').peek('key-1');
      const unknownPeekValue = cache.peek('key-3');
      const value = cache.set('key-3', 'value-3').get('key-1');

      expect(peekValue).toBe('value-1');
      expect(unknownPeekValue).toBeUndefined();
      expect(value).toBeUndefined();
    });
  });

  describe('get', () => {
    it('should splay the key to the top of the list', () => {
      const cache = new LRUCache(3);
      const value = cache.set('key-1', 'value-1').set('key-2', 'value-2').set('key-3', 'value-3').get('key-2');

      /** @ts-expect-error Accessing private member */
      expect(cache.head).toBe(1);
      expect(value).toBe('value-2');
    });
  });

  describe('has', () => {
    it('should return true if the key is found', () => {
      const cache = new LRUCache(1);
      const value = cache.set('key', 'value').has('key');
      expect(value).toBe(true);
    });

    it('should return false if the key is not found', () => {
      const cache = new LRUCache(1);
      const value = cache.has('key');
      expect(value).toBe(false);
    });
  });

  describe('remove', () => {
    it('should delete the value for the given key and return its value', () => {
      /** Removing head element */
      const cacheOne = new LRUCache(2);
      const deletedValueOne = cacheOne.set('key-1', 'value-1').set('key-2', 'value-2').remove('key-1');
      const valueOne = cacheOne.get('key-1');

      /** Removing tail element */
      const cacheTwo = new LRUCache(2);
      const deletedValueTwo = cacheTwo.set('key-1', 'value-1').set('key-2', 'value-2').remove('key-2');
      const valueTwo = cacheTwo.get('key-2');

      expect(deletedValueOne).toBe('value-1');
      expect(deletedValueTwo).toBe('value-2');
      expect(valueOne).toBeUndefined();
      expect(valueTwo).toBeUndefined();
    });

    it('should return undefined for not found key', () => {
      const cache = new LRUCache(1);
      const deletedValue = cache.remove('key');
      expect(deletedValue).toBeUndefined();
    });

    it('should clear if the size is 1 before removing', () => {
      const cache = new LRUCache(10);
      const mockClear = jest.spyOn(cache, 'clear');
      cache.set('key', 'value').remove('key');
      expect(mockClear).toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear the cache', () => {
      const cache = new LRUCache(2);
      cache.set('key-1', 'value-1').set('key-2', 'value-2');
      cache.clear();

      const obj = cache as any;
      expect(obj.items).toStrictEqual({});
      expect(obj.head).toBe(0);
      expect(obj.tail).toBe(0);
      expect(obj.size).toBe(0);
    });
  });
});
