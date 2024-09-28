/**
 * Importing npm packages
 */
import { AsyncLocalStorage } from 'async_hooks';

import { Injectable } from '@shadow-library/app';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { MiddlewareHandler } from '../interfaces';

/**
 * Defining types
 */

type Key = string | symbol;

/**
 * Declaring the constants
 */
const REQUEST = Symbol('request');
const RESPONSE = Symbol('response');
const RID = Symbol('rid');

@Injectable()
export class Context {
  private readonly storage = new AsyncLocalStorage<Map<Key, unknown>>();

  init(): MiddlewareHandler {
    return async (req, res) => {
      const store = new Map<Key, unknown>();
      store.set(REQUEST, req);
      store.set(RESPONSE, res);
      store.set(RID, req.id);
      this.storage.enterWith(store);
    };
  }

  protected get<T>(key: Key, throwOnMissing: true): T;
  protected get<T>(key: Key, throwOnMissing?: false): T | null;
  protected get<T>(key: Key, throwOnMissing?: boolean): T | null {
    const store = this.storage.getStore();
    if (!store) throw new InternalError('Context not yet initialized');
    const value = store.get(key) as T | undefined;
    if (throwOnMissing && value === undefined) {
      throw new InternalError(`Key '${key.toString()}' not found in the context`);
    }
    return value ?? null;
  }

  protected set<T>(key: Key, value: T): this {
    const store = this.storage.getStore();
    if (!store) throw new InternalError('Context not yet initialized');
    store.set(key, value);
    return this;
  }

  getRequest(): Request {
    return this.get<Request>(REQUEST, true);
  }

  getResponse(): Response {
    return this.get<Response>(RESPONSE, true);
  }

  getRID(): string {
    return this.get<string>(RID, true);
  }
}
