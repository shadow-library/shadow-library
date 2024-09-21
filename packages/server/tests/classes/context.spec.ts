/**
 * Importing npm packages
 */
import { afterEach, describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Context } from '@shadow-library/server';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const data = { req: { id: 1 }, res: {}, get: 'GET', set: 'SET' };
const store = { get: jest.fn().mockReturnValue(data.get), set: jest.fn().mockReturnValue(data.set) };
const getStore = jest.fn().mockReturnValue(store);

describe('Context', () => {
  const context = new Context();
  context['storage'].getStore = getStore as any;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the context', () => {
    const fn = jest.spyOn(context['storage'], 'enterWith');
    const middleware = context.init();
    middleware(data.req as any, data.res as any);

    expect(fn).toHaveBeenCalledWith(expect.any(Map));
  });

  describe('set', () => {
    it('should throw an error if context is not inited', () => {
      getStore.mockReturnValueOnce(undefined);
      expect(() => context.set('key', 'value')).toThrowError('Context not yet initialized');
    });

    it('should set the context value', () => {
      context.set('key', 'value');
      expect(store.set).toHaveBeenCalledWith('key', 'value');
    });
  });

  describe('get', () => {
    it('should get the context value', () => {
      const req = context.getRequest();
      expect(store.get).toHaveBeenCalledWith(expect.any(Symbol));
      expect(req).toBe(data.get);
    });

    it('should throw an error if context is not inited', () => {
      getStore.mockReturnValueOnce(undefined);
      expect(() => context.getResponse()).toThrowError('Context not yet initialized');
    });

    it('should throw an error if value not present when throwIfMissing is true', () => {
      store.get.mockReturnValueOnce(undefined);
      expect(() => context.getRID()).toThrowError("Key 'Symbol(rid)' not found in the context");
    });

    it('should return null if value not present when throwIfMissing is false', () => {
      store.get.mockReturnValueOnce(undefined);
      expect(context.get('random')).toBeNull();
    });
  });
});
