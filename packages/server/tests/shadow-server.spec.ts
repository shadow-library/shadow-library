/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { HttpMethod, Request, Response, ServerConfig, ShadowServer } from '@shadow-library/server';

import { Utils } from './utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const error = new Error('Stop Server Error');
const mockHandler = jest
  .fn<() => Promise<void>>()
  .mockImplementationOnce(async () => {})
  .mockRejectedValueOnce(error);
const mockServer = {
  listen: jest.fn((_arg1, _arg2, callback: () => void) => callback()),
  close: jest
    .fn<(cb: (err?: Error) => void) => void>()
    .mockImplementationOnce(callback => callback())
    .mockImplementationOnce(callback => callback(error)),
};

describe('ShadowServer', () => {
  const config = new ServerConfig();
  let server: ShadowServer;

  it('should create a new instance of ShadowServer', () => {
    const mockFn = jest.fn();
    server = new ShadowServer(config);
    /** @ts-expect-error accessing private property */
    server.router.lookup = mockFn;
    (server as any).server._events.request(1, 2);
    /** @ts-expect-error accessing private property */
    server.server = mockServer;

    expect(server).toBeInstanceOf(ShadowServer);
    expect(mockFn).toBeCalledWith(1, 2);
  });

  it('should return the default route handler', () => {
    const errorHandler = jest.fn();
    const req = Utils.getMockedRequest('GET', 'https://shadow-apps.com/test-single');
    config.setErrorHandler({ handle: errorHandler });
    /** @ts-expect-error accessing private property */
    server.getDefaultRouteHandler()(req, {});

    expect(errorHandler).toBeCalledWith(expect.any(Error), expect.any(Request), expect.any(Response));
  });

  it('should register a route with single method', async () => {
    const metadata = { method: HttpMethod.GET, path: '/test-single' };
    const router = server.getRouter();
    router.register({ metadata, handler: mockHandler, paramtypes: [Request, { name: 'params' }, Response, { name: 'query' }] });
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute('GET', '/test-single');
    expect(route).toBeDefined();
  });

  it('should register route with ALL method', async () => {
    const metadata = { method: HttpMethod.ALL, path: '/test-all' };
    const methods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL);
    const router = server.getRouter();
    router.register({ metadata, handler: mockHandler, paramtypes: [] });

    methods.forEach(method => {
      /** @ts-expect-error accessing private property */
      const route = server.router.findRoute(method, '/test-all');
      expect(route).toBeDefined();
    });
  });

  it('should start the server', async () => {
    await expect(server.start()).resolves.toBeUndefined();
    expect(mockServer.listen).toBeCalledWith(8080, '127.0.0.1', expect.any(Function));
  });

  it('should handle the route', async () => {
    const req = Utils.getMockedRequest('GET', 'https://shadow-apps.com/test-single');
    const res = Utils.getMockedResponse();
    const params = { id: '123' };
    const query = { search: 'test' };
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute('GET', '/test-single');
    await route?.handler(req, res, params, {}, query);
    const args = mockHandler.mock.lastCall as any[];

    expect(args).toStrictEqual([expect.any(Request), params, expect.any(Response), query]);
    expect(args[0].raw).toBe(req);
    expect(args[2].raw).toBe(res);
  });

  it('should handle the route with error', async () => {
    const errorHandler = jest.fn();
    const req = Utils.getMockedRequest('GET', 'https://shadow-apps.com/test-single');
    const res = Utils.getMockedResponse();
    config.setErrorHandler({ handle: errorHandler });
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute('GET', '/test-single');
    await route?.handler(req, res, {}, {}, {});

    expect(errorHandler).toBeCalledWith(error, expect.any(Request), expect.any(Response));
  });

  it('should stop the server', async () => {
    await expect(server.stop()).resolves.toBeUndefined();
    expect(mockServer.close).toBeCalledWith(expect.any(Function));
    await expect(server.stop()).rejects.toThrow(error);
  });
});
