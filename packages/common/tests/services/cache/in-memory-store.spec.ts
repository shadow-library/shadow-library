/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { InMemoryStore } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('InMemoryStore', () => {
  let store: InMemoryStore;

  it('should initialize the store', () => {
    store = new InMemoryStore();
    expect(store).toBeInstanceOf(InMemoryStore);
  });

  it('should set and get a value', () => {
    const actualValue = 'value';
    store.set('key', actualValue);
    const value = store.get('key');
    expect(value).toBe(actualValue);
  });

  it('should get a default value if key not present', () => {
    const defaultValue = 'default-value';
    const value = store.get('random-key', defaultValue);
    expect(value).toBe(defaultValue);
  });

  it('should delete a key', () => {
    store.del('key');
    const value = store.get('key');
    expect(value).toBeUndefined();
  });

  it('should throw an error if value is not an array', () => {
    const key = 'invalid-array';
    store.set(key, 'value');

    expect(() => store.insert(key, 'value')).toThrowError(`The value at key '${key}' is not an array`);
  });

  it('should insert a value in an array', () => {
    store.insert('key', 'value1');
    store.insert('key', 'value2');
    const values = store.get('key');
    expect(values).toStrictEqual(['value1', 'value2']);
  });

  it('should remove a value from an array', () => {
    store.remove('key', 'value1');
    const values = store.get('key');
    expect(values).toStrictEqual(['value2']);
  });

  it('should throw an error if value is not a number', () => {
    store.set('key', 'value');
    expect(() => store.inc('key', 1)).toThrow();
  });

  it('should increment a number if key is present', () => {
    store.set('number', 5);
    const value = store.inc('number', -1);
    expect(value).toBe(4);
  });

  it('should set a number if key is not present', () => {
    const value = store.inc('new-number', 1);
    expect(value).toBe(1);
  });
});
