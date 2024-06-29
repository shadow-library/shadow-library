/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */

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
  private head: number = 0;
  private tail: number = 0;
  private size: number = 0;
  private deletedSize: number = 0;

  private items: Record<string, number> = {};
  private forward: UintArray;
  private backward: UintArray;
  private deleted: UintArray;
  private keys: string[];
  private values: any[];

  constructor(private readonly capacity: number) {
    if (capacity <= 0) throw new InternalError('Cache capacity must be a positive number greater than 0');

    const TypedArray = LRUCache.getTypedArray(capacity);
    this.forward = new TypedArray(capacity);
    this.backward = new TypedArray(capacity);
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
    const oldHead = this.head;
    if (this.head === pointer) return this;

    const previous = this.backward[pointer] as number;
    const next = this.forward[pointer] as number;

    if (this.tail === pointer) this.tail = previous;
    else this.backward[next] = previous;

    this.forward[previous] = next;

    this.backward[oldHead] = pointer;
    this.head = pointer;
    this.forward[pointer] = oldHead;

    return this;
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.deletedSize = 0;
    this.items = {};

    this.forward.fill(0);
    this.backward.fill(0);
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
      pointer = this.tail;
      this.tail = this.backward[pointer] as number;
      const key = this.keys[pointer] as string;
      delete this.items[key];
    }

    /** Storing key and value */
    this.items[key] = pointer;
    this.keys[pointer] = key;
    this.values[pointer] = value;

    /** Updating the pointers */
    this.forward[pointer] = this.head;
    this.backward[this.head] = pointer;
    this.head = pointer;

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

    const previous = this.backward[pointer] as number;
    const next = this.forward[pointer] as number;

    if (this.head === pointer) this.head = next;
    else if (this.tail === pointer) this.tail = previous;

    this.forward[previous] = next;
    this.backward[next] = previous;

    this.size--;
    this.deleted[this.deletedSize++] = pointer;

    return deletedValue;
  }
}
