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
const mockHandler = jest.fn();
const mockServer = {
  listen: jest.fn((_arg1, _arg2, callback: () => void) => callback()),
  close: jest
    .fn<(cb: (err?: Error) => void) => void>()
    .mockImplementationOnce(callback => callback())
    .mockImplementationOnce(callback => callback(error)),
};

describe('ShadowServer', () => {
  let server: ShadowServer;

  it('should create a new instance of ShadowServer', () => {
    const config = new ServerConfig();
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

  it('should register a route with single method', async () => {
    const router = server.getRouter();
    router.register({ metadata: { method: HttpMethod.GET, path: '/test-single' }, handler: mockHandler });
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute('GET', '/test-single');
    expect(route).toBeDefined();
  });

  it('should register route with ALL method', async () => {
    const methods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL);
    const router = server.getRouter();
    router.register({ metadata: { method: HttpMethod.ALL, path: '/test-all' }, handler: mockHandler });

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
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute('GET', '/test-single');
    await route?.handler(req, res, {}, {}, {});
    const [request, response] = mockHandler.mock.lastCall ?? [];

    expect(request).toBeInstanceOf(Request);
    /** @ts-expect-error accessing private property */
    expect(request.raw).toBe(req);

    expect(response).toBeInstanceOf(Response);
    /** @ts-expect-error accessing private property */
    expect(response.raw).toBe(res);
  });

  it('should stop the server', async () => {
    await expect(server.stop()).resolves.toBeUndefined();
    expect(mockServer.close).toBeCalledWith(expect.any(Function));
    await expect(server.stop()).rejects.toThrow(error);
  });
});
