/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { InternalError, LRUCache } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('LRUCache', () => {
  let cache: LRUCache;

  beforeEach(() => {
    cache = new LRUCache(3);
  });

  describe('constructor()', () => {
    it('should throw an error if capacity is less than or equal to 0', () => {
      expect(() => new LRUCache(0)).toThrowError(InternalError);
      expect(() => new LRUCache(-1)).toThrowError(InternalError);
    });

    it('should initialize cache correctly with a valid capacity', () => {
      const cache = new LRUCache(5);
      expect(cache).toBeInstanceOf(LRUCache);
    });
  });

  describe('set()', () => {
    it('should set a value in the cache', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should evict the least recently used item when cache is full', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // This should evict 'key1'

      expect(cache.has('key1')).toBe(false);
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should update the value if key already exists', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'newValue1');
      expect(cache.get('key1')).toBe('newValue1');
    });

    it('should move the key to the front when setting an existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.get('key1'); // Access 'key1' to make it most recently used
      cache.set('key4', 'value4'); // Evict the least recently used (which should now be 'key2')

      expect(cache.has('key1')).toBe(true);
      expect(cache.has('key2')).toBe(false);
    });

    it('should reuse a deleted entry if one is available', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.remove('key2');
      cache.set('key4', 'value4'); // Set a new value, this should reuse the deleted space (pointer)

      expect(cache.get('key4')).toBe('value4');
      expect(cache.get('key2')).toBeUndefined(); // key2 was deleted and replaced
      expect(cache['keys'][1]).toBe('key4'); // key4 should be at the deleted pointer
    });
  });

  describe('get()', () => {
    it('should return undefined if key does not exist', () => {
      expect(cache.get('non-existent')).toBeUndefined();
    });

    it('should return the value associated with the key', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });

    it('should move the accessed key to the front (most recently used)', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1'); // 'key1' becomes most recently used
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // This should evict 'key2' instead of 'key1'

      expect(cache.has('key2')).toBe(false);
      expect(cache.has('key1')).toBe(true);
    });
  });

  describe('has()', () => {
    it('should return true if the key exists in the cache', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false if the key does not exist', () => {
      expect(cache.has('non-existent')).toBe(false);
    });
  });

  describe('peek()', () => {
    it('should return the value without updating the recently used status', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.peek('key1'); // Peek 'key1' (it should not become most recently used)
      cache.set('key3', 'value3');
      cache.set('key4', 'value4'); // This should evict 'key1' because it was not accessed

      expect(cache.has('key1')).toBe(false); // 'key1' should be evicted
    });

    it('should return undefined if the key does not exist', () => {
      expect(cache.peek('non-existent')).toBeUndefined();
    });
  });

  describe('remove()', () => {
    it('should remove a key and return its value', () => {
      cache.set('key1', 'value1');
      expect(cache.remove('key1')).toBe('value1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should return undefined if the key does not exist', () => {
      expect(cache.remove('non-existent')).toBeUndefined();
    });

    it('should correctly handle removing the last item in the cache', () => {
      cache.set('key1', 'value1');
      cache.remove('key1');
      expect(cache.get('key1')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
    });

    it('should correctly handle removing the head item and update pointers', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.remove('key3'); // Remove the head (most recently used) item

      expect(cache.peek('key3')).toBeUndefined();
      expect(cache.peek('key2')).toBe('value2'); // 'key2' should now be the head
      expect(cache['top']).toBe(1);
    });

    it('should correctly handle removing the tail item and update pointers', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.remove('key1'); // Remove the tail (least recently used) item

      expect(cache.peek('key1')).toBeUndefined();
      expect(cache.peek('key2')).toBe('value2');
      expect(cache['bottom']).toBe(1); // 'key2' should now be the tail
    });

    it('should update forward and backward pointers when removing an item', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.remove('key2'); // 'key2' is in the middle, so pointers for 'key1' and 'key3' should update

      expect(cache.peek('key1')).toBe('value1');
      expect(cache.peek('key3')).toBe('value3');

      expect(cache['upward'][0]).toBe(2); // 'key1' should now point to 'key3'
      expect(cache['downward'][2]).toBe(0); // 'key3' should now point back to 'key1'
    });

    it('should add the deleted pointer back to the deleted array', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.remove('key2');

      expect(cache['deletedSize']).toBe(1);
      expect(cache['deleted'][0]).toBe(1); // 'key2' was at pointer 1
    });
  });

  describe('clear()', () => {
    it('should clear all items from the cache', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.clear();

      expect(cache.get('key1')).toBeUndefined();
      expect(cache.get('key2')).toBeUndefined();
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });
  });

  describe('splayOnTop()', () => {
    it('should not modify anything if the pointer is already the head', () => {
      cache.set('key1', 'value1');
      cache['splayOnTop'](0);

      expect(cache.get('key1')).toBe('value1');
    });

    it('should move a pointer to the top when it is not the head', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      cache['splayOnTop'](1);
      expect(cache['top']).toBe(1);
    });
  });

  describe('getTypedArray()', () => {
    it('should return Uint8Array if capacity is less than or equal to 256', () => {
      const TypedArray = LRUCache['getTypedArray'](256);
      expect(TypedArray).toBe(Uint8Array);
    });

    it('should return Uint16Array if capacity is less than or equal to 65536', () => {
      const TypedArray = LRUCache['getTypedArray'](65536);
      expect(TypedArray).toBe(Uint16Array);
    });

    it('should return Uint32Array if capacity is less than or equal to 4294967295', () => {
      const TypedArray = LRUCache['getTypedArray'](4294967295);
      expect(TypedArray).toBe(Uint32Array);
    });

    it('should throw an error if capacity exceeds 4294967296', () => {
      expect(() => LRUCache['getTypedArray'](4294967297)).toThrow(InternalError);
    });
  });
});
