/**
 * Importing npm packages
 */
import path from 'path';
import { Server as TLSServer } from 'tls';

import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Router } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { HttpMethod, Request, Response, ServerConfig, ShadowServer } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

import { Utils } from './utils';

/**
 * Defining types
 */

type Handler = () => Promise<Record<string, string>>;

/**
 * Declaring the constants
 */
const data = { msg: 'Hello World' };
const error = new Error('Stop Server Error');
const mockMiddleware = jest
  .fn()
  .mockImplementationOnce(() => {})
  .mockImplementationOnce((_req, res: any) => res.json(JSON.stringify(data)));
const mockHandler = jest.fn<Handler>().mockResolvedValueOnce(data).mockRejectedValueOnce(error);
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
  let router: Router;

  afterEach(() => {
    mockHandler.mockClear();
    mockMiddleware.mockClear();
  });

  it('should create a http instance of ShadowServer', () => {
    const mockFn = jest.fn();
    server = new ShadowServer(config);
    router = server.getRouter();
    /** @ts-expect-error accessing private property */
    server.router.lookup = mockFn;
    (server as any).server._events.request(1, 2);
    /** @ts-expect-error accessing private property */
    server.server = mockServer;

    expect(server).toBeInstanceOf(ShadowServer);
    expect(mockFn).toBeCalledWith(1, 2);
  });

  it('should create a https instance of ShadowServer', () => {
    const mockFn = jest.fn();
    const dirname = path.join(__dirname, 'sample');
    const config = new ServerConfig().setHttpsCertificate({ key: `${dirname}/private.key`, cert: `${dirname}/certificate.crt` });
    const server = new ShadowServer(config);
    /** @ts-expect-error accessing private property */
    const instance = server.server;
    /** @ts-expect-error accessing private property */
    server.router.lookup = mockFn;
    (server as any).server._events.request(1, 2);

    expect(mockFn).toBeCalledWith(1, 2);
    expect(instance).toBeInstanceOf(TLSServer);
    expect(instance.constructor.name).toBe('Http2SecureServer');
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
    router.register({ metadata, handler: mockHandler, paramtypes: [Request, { name: 'params' }, Response, { name: 'query' }] });
    /** @ts-expect-error accessing private property */
    const route = server.routes.find(r => r.metadata === metadata);
    expect(route).toBeDefined();
  });

  it('should register route with ALL method', async () => {
    const metadata = { method: HttpMethod.ALL, path: '/test-all' };
    router.register({ metadata, handler: mockHandler, paramtypes: [] });
    /** @ts-expect-error accessing private property */
    const route = server.routes.find(r => r.metadata === metadata);
    expect(route).toBeDefined();
  });

  it('should register middleware', async () => {
    class Middleware {
      generate = () => mockMiddleware;
    }
    const metadata = { [MIDDLEWARE_WATERMARK]: true, target: Middleware };
    router.register({ metadata, handler: () => mockMiddleware, paramtypes: [] });
    /** @ts-expect-error accessing private property */
    const middleware = server.middlewares.find(r => r.metadata === metadata);
    expect(middleware).toBeDefined();
  });

  it('should start the server', async () => {
    await expect(server.start()).resolves.toBeUndefined();
    expect(mockServer.listen).toBeCalledWith(8080, '127.0.0.1', expect.any(Function));
  });

  it('should handle the route', async () => {
    const params = { id: '123' };
    const query = { search: 'test' };
    const route = Utils.getRoute(server, 'GET', '/test-single');
    await route?.handler(params, query);

    expect(mockMiddleware).toBeCalledWith(expect.any(Request), expect.any(Response));
    expect(mockHandler).toBeCalledWith(expect.any(Request), params, expect.any(Response), query);
  });

  it('should stop execution after response is sent', async () => {
    const route = Utils.getRoute(server, 'POST', '/test-all');
    await route?.handler();

    expect(mockMiddleware).toBeCalledWith(expect.any(Request), expect.any(Response));
    expect(mockHandler).not.toBeCalled();
  });

  it('should handle the route with error', async () => {
    const errorHandler = jest.fn();
    config.setErrorHandler({ handle: errorHandler });

    const route = Utils.getRoute(server, 'GET', '/test-single');
    await route?.handler();

    expect(errorHandler).toBeCalledWith(error, expect.any(Request), expect.any(Response));
  });

  it('should stop the server', async () => {
    await expect(server.stop()).resolves.toBeUndefined();
    expect(mockServer.close).toBeCalledWith(expect.any(Function));
    await expect(server.stop()).rejects.toThrow(error);
  });
});
