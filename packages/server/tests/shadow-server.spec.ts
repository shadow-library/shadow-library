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
const renderHandler = jest.fn();

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

    const headers = { 'X-Header-One': 'Value One', 'X-Header-Two': () => Date.now().toString() };
    const single = { method: HttpMethod.POST, basePath: '/api', path: '/test-single', headers };
    router.register({ metadata: single, handler: mockHandler, paramtypes: [Object, 'query', String, 'body'] });

    const multiple = { method: HttpMethod.ALL, path: '/test-all' };
    router.register({ metadata: multiple, handler: mockHandler, paramtypes: [] });

    const redirect = { method: HttpMethod.GET, path: '/redirect', redirect: '/api/test-single' };
    router.register({ metadata: redirect, handler: mockHandler, paramtypes: [] });

    const render = { method: HttpMethod.GET, path: '/test-render', render: 'sample' };
    router.register({ metadata: render, handler: mockHandler, paramtypes: [] });

    const middleware = { [MIDDLEWARE_WATERMARK]: true, target: Object } as const;
    const unNeededMiddleware = { [MIDDLEWARE_WATERMARK]: true, target: Object } as const;
    router.register({ metadata: middleware, handler: () => mockMiddleware, paramtypes: [] });
    router.register({ metadata: unNeededMiddleware, handler: () => null, paramtypes: [] });

    expect(server['routes']).toHaveLength(4);
    expect(server['middlewares']).toHaveLength(2);

    server['server'].decorateReply('viewAsync', function (this: any, ...args: unknown[]) {
      renderHandler(...args);
      return this.send('View');
    });
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
    const response = await server.mockRequest().post('/api/test-single?id=123').body(body);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toStrictEqual(data);

    expect(mockHandler).toBeCalledTimes(1);
    expect(mockMiddleware).toBeCalledTimes(1);
    expect(mockHandler).toBeCalledWith(null, { id: '123' }, null, body);

    expect(response.headers).toHaveProperty('x-header-one', 'Value One');
    expect(response.headers).toHaveProperty('x-header-two', expect.stringMatching(/^[0-9]{13}$/));
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

  it('should redirect to another route', async () => {
    const response = await server.mockRequest().get('/redirect');

    expect(response.statusCode).toBe(301);
    expect(mockHandler).toBeCalledTimes(1);
    expect(response.headers).toHaveProperty('location', '/api/test-single');
  });

  it('should render the view', async () => {
    const response = await server.mockRequest().get('/test-render').body(body);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('View');
    expect(mockHandler).toBeCalledTimes(1);
    expect(renderHandler).toBeCalledTimes(1);
    expect(renderHandler).toBeCalledWith('sample', data);
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
