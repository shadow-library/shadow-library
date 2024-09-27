/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { InternalError } from '../../errors';

/**
 * Defining types
 */

type UintArray = Uint8Array | Uint16Array | Uint32Array;

type UintArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor;

/**
 * Declaring the constants
 */
const MAX_8BIT_INTEGER = Math.pow(2, 8);
const MAX_16BIT_INTEGER = Math.pow(2, 16);
const MAX_32BIT_INTEGER = Math.pow(2, 32);

export class LRUCache {
  /*!
   * The cache is a stack where recently used items are moved to the top of the stack.
   *
   * `top` - The most recently used item in the cache
   * `bottom` - The least recently used item in the cache
   * `downward` - The earlier item in the cache
   * `upward` - The recent item in the cache
   */

  private top: number = 0;
  private bottom: number = 0;
  private downward: UintArray;
  private upward: UintArray;

  private deletedSize: number = 0;
  private deleted: UintArray;

  private size: number = 0;
  private keys: string[];
  private values: any[];
  private items: Record<string, number> = {};

  constructor(private readonly capacity: number) {
    if (capacity <= 0) throw new InternalError('Cache capacity must be a positive number greater than 0');

    const TypedArray = LRUCache.getTypedArray(capacity);
    this.downward = new TypedArray(capacity);
    this.upward = new TypedArray(capacity);
    this.deleted = new TypedArray(capacity);

    this.keys = new Array(capacity);
    this.values = new Array(capacity);
  }

  private static getTypedArray(capacity: number): UintArrayConstructor {
    if (capacity <= MAX_8BIT_INTEGER) return Uint8Array;
    if (capacity <= MAX_16BIT_INTEGER) return Uint16Array;
    if (capacity <= MAX_32BIT_INTEGER) return Uint32Array;
    throw new InternalError('Cache capacity must be less than 4294967295');
  }

  private splayOnTop(pointer: number): LRUCache {
    const oldHead = this.top;
    if (this.top === pointer) return this;

    const previous = this.upward[pointer] as number;
    const next = this.downward[pointer] as number;

    if (this.bottom === pointer) this.bottom = previous;
    else this.upward[next] = previous;

    this.downward[previous] = next;

    this.upward[oldHead] = pointer;
    this.top = pointer;
    this.downward[pointer] = oldHead;

    return this;
  }

  clear(): void {
    this.top = 0;
    this.bottom = 0;
    this.size = 0;
    this.deletedSize = 0;
    this.items = {};

    this.downward.fill(0);
    this.upward.fill(0);
    this.deleted.fill(0);

    this.keys = new Array(this.capacity);
    this.values = new Array(this.capacity);
  }

  set<T>(key: string, value: T): LRUCache {
    let pointer = this.items[key];

    if (typeof pointer !== 'undefined') {
      this.splayOnTop(pointer);
      this.values[pointer] = value;
      return this;
    }

    if (this.size < this.capacity) {
      if (this.deletedSize > 0) pointer = this.deleted[--this.deletedSize] as number;
      else pointer = this.size;
      this.size++;
    } else {
      pointer = this.bottom;
      this.bottom = this.upward[pointer] as number;
      const key = this.keys[pointer] as string;
      delete this.items[key];
    }

    /** Storing key and value */
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = value;

    /** Updating the pointers */
    this.downward[pointer] = this.top;
    this.upward[this.top] = pointer;
    this.top = pointer;

    return this;
  }

  has(key: string): boolean {
    return key in this.items;
  }

  get<T>(key: string): T | undefined {
    const pointer = this.items[key];
    if (typeof pointer === 'undefined') return;
    this.splayOnTop(pointer);
    return this.values[pointer];
  }

  peek<T>(key: string): T | undefined {
    const pointer = this.items[key];
    if (typeof pointer === 'undefined') return;
    return this.values[pointer];
  }

  remove<T>(key: string): T | undefined {
    const pointer = this.items[key];

    if (typeof pointer === 'undefined') return;

    const deletedValue = this.values[pointer] as T;
    delete this.items[key];

    if (this.size === 1) {
      this.clear();
      return deletedValue;
    }

    const previous = this.upward[pointer] as number;
    const next = this.downward[pointer] as number;

    if (this.top === pointer) this.top = next;
    else if (this.bottom === pointer) this.bottom = previous;

    this.downward[previous] = next;
    this.upward[next] = previous;

    this.size--;
    this.deleted[this.deletedSize++] = pointer;

    return deletedValue;
  }
}
