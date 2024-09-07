/**
 * Importing npm packages
 */

import { afterEach, describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ErrorHandler, HttpMethod, HttpMiddleware, ServerConfig, ShadowServer } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const body = { search: 'test' };
const data = { msg: 'Hello World' };
const error = new Error('Stop Server Error');
const mockMiddleware = jest.fn<HttpMiddleware>(() => {});
const mockHandler = jest.fn(async () => data);

describe('ShadowServer', () => {
  const config = new ServerConfig();
  let server: ShadowServer;

  afterEach(() => {
    mockHandler.mockClear();
    mockMiddleware.mockClear();
  });

  it('should create a http instance of ShadowServer', () => {
    server = new ShadowServer(config);
    expect(server).toBeInstanceOf(ShadowServer);
  });

  it('should register all the middleware and routes', async () => {
    const router = server.getRouter();
    expect(router).toBeDefined();

    const single = { method: HttpMethod.POST, path: '/test-single' };
    router.register({ metadata: single, handler: mockHandler, paramtypes: [Object, 'query', String, 'body'] });

    const multiple = { method: HttpMethod.ALL, path: '/test-all' };
    router.register({ metadata: multiple, handler: mockHandler, paramtypes: [] });

    class Middleware {
      generate = () => mockMiddleware;
    }
    const middleware = { [MIDDLEWARE_WATERMARK]: true, target: Middleware } as const;
    router.register({ metadata: middleware, handler: () => mockMiddleware, paramtypes: [] });

    expect(server['routes']).toHaveLength(2);
    expect(server['middlewares']).toHaveLength(1);
  });

  it('should start the server', async () => {
    const mockFn = jest.fn() as any;
    server['server'].listen = mockFn;

    await expect(server.start()).resolves.toBeUndefined();
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith({ port: config.getPort(), host: config.getHostname() });
  });

  it('should return the default route handler', async () => {
    const response = await server.mockRequest().get('/not-found');
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: 'Not Found' });
  });

  it('should be able to access single method route', async () => {
    const response = await server.mockRequest().post('/test-single?id=123').body(body);
    expect(response.statusCode).toBe(200);
    expect(response.json()).toStrictEqual(data);

    expect(mockHandler).toBeCalledTimes(1);
    expect(mockMiddleware).toBeCalledTimes(1);
    expect(mockHandler).toBeCalledWith(null, { id: '123' }, null, body);
  });

  it('should be able to access multi method route', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
    for (const method of methods) {
      const response = await server.mockRequest({ method, url: '/test-all' });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual(data);
      expect(mockHandler).toBeCalledTimes(1);
      mockHandler.mockClear();
    }
  });

  it('should stop execution after response is sent', async () => {
    const data = { msg: 'Middleware' };
    mockMiddleware.mockImplementationOnce((_, res) => res.status(400).send(data));
    const response = await server.mockRequest().get('/test-all');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual(data);
    expect(mockMiddleware).toHaveBeenCalledTimes(1);
    expect(mockHandler).not.toBeCalled();
  });

  it('should handle the route with error', async () => {
    const errorHandler = jest.fn<ErrorHandler>((err, _req, res) => res.status(401).send({ message: err.message }));
    config.setErrorHandler(errorHandler);
    mockHandler.mockRejectedValueOnce(error);

    const response = await server.mockRequest().put('/test-all').body(data);
    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({ message: error.message });
    expect(errorHandler).toBeCalledTimes(1);
    expect(errorHandler).toBeCalledWith(error, expect.anything(), expect.anything());
  });

  it('should stop the server', async () => {
    const mockFn = jest.fn(async () => {}) as any;
    server['server'].close = mockFn;

    await expect(server.stop()).resolves.toBeUndefined();
    expect(mockFn).toBeCalledTimes(1);
  });
});
