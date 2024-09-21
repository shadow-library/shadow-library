/**
 * Importing npm packages
 */
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { AppError, ErrorCode, ValidationError } from '@shadow-library/common';
import { Type } from '@sinclair/typebox';

/**
 * Importing user defined packages
 */
import { ErrorHandler, HttpMethod, MiddlewareHandler, ServerConfig, ShadowServer } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const body = { search: 'test' };
const data = { msg: 'Hello World' };
const error = new AppError(ErrorCode.UNKNOWN);

const contextFn = jest.fn();
const renderer = jest.fn();
const handler = jest.fn(async () => data);
const middlewares = { before: jest.fn<MiddlewareHandler>(() => {}), after: jest.fn<MiddlewareHandler>(() => {}) };

describe('ShadowServer', () => {
  const config = new ServerConfig();
  let server: ShadowServer;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a http instance of ShadowServer', () => {
    config.addDefaultErrorSchema('4xx').addDefaultErrorSchema('5xx');
    config.setContext({ init: () => contextFn } as any);
    server = new ShadowServer(config);
    expect(server).toBeInstanceOf(ShadowServer);
  });

  it('should register all the middleware and routes', async () => {
    const router = server.getRouter();
    expect(router).toBeDefined();

    const schema = Type.Object({});
    const schemas = { body: schema, query: schema, params: schema };
    const headers = { 'X-Header-One': 'Value One', 'X-Header-Two': () => Date.now().toString() };
    const single = { method: HttpMethod.POST, basePath: '/api', path: '/test-single', headers, rawBody: true, schemas };
    router.register({ metadata: single, handler, paramtypes: ['request', 'query', String, 'body'] });

    const multiple = { method: HttpMethod.ALL, path: '/test-all' };
    router.register({ metadata: multiple, handler, paramtypes: ['request'] });

    const redirect = { method: HttpMethod.GET, path: '/redirect', redirect: '/api/test-single' };
    router.register({ metadata: redirect, handler, paramtypes: [] });

    const render = { method: HttpMethod.GET, path: '/test-render', render: 'sample' };
    router.register({ metadata: render, handler, paramtypes: [] });

    const options = { type: 'before', weight: 0 };
    const middleware = { [MIDDLEWARE_WATERMARK]: true, target: Object, generates: true, options } as const;
    const afterMiddleware = { ...middleware, generates: false, options: { ...options, type: 'after' } } as const;
    router.register({ metadata: middleware, handler: () => middlewares.before, paramtypes: [] });
    router.register({ metadata: middleware, handler: () => null, paramtypes: [] });
    router.register({ metadata: afterMiddleware, handler: middlewares.after, paramtypes: [] });

    expect(server['routes']).toHaveLength(4);
    expect(server['middlewares']).toHaveLength(3);

    server.getInstance().decorateReply('viewAsync', function (this: any, ...args: unknown[]) {
      renderer(...args);
      return this.send('View');
    });
  });

  it('should format the validation error', async () => {
    const errors = [{ instancePath: '', message: "must have property 'password'" }, { instancePath: '/email' }];
    const formattedError = server['formatSchemaErrors'](errors as any, 'body');

    expect(formattedError).toBeInstanceOf(ValidationError);
    expect(formattedError.getErrors()).toStrictEqual([
      { field: 'body', msg: "must have property 'password'" },
      { field: 'body.email', msg: 'Field validation failed' },
    ]);
  });

  it('should start the server', async () => {
    const mockFn = jest.fn() as any;
    server.getInstance().listen = mockFn;

    await expect(server.start()).resolves.toBeUndefined();
    expect(mockFn).toBeCalledTimes(1);
    expect(mockFn).toBeCalledWith({ port: config.getPort(), host: config.getHostname() });
  });

  it('should throw an error when adding a route after the server is inited', async () => {
    const route = { metadata: {}, handler: () => {}, paramtypes: [] };
    expect(() => server.getRouter().register(route)).toThrowError();
  });

  it('should return the default route handler', async () => {
    const response = await server.mockRequest().get('/not-found');
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ code: 'S002', message: 'Not Found', type: 'NOT_FOUND' });
  });

  it('should be able to access single method route', async () => {
    const response = await server.mockRequest().post('/api/test-single?id=123').body(body);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toStrictEqual(data);

    expect(contextFn).toBeCalledTimes(1);
    expect(handler).toBeCalledTimes(1);
    expect(middlewares.before).toBeCalledTimes(1);
    expect(middlewares.after).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(expect.objectContaining({ rawBody: expect.any(Buffer) }), { id: '123' }, null, body);

    expect(response.headers).toHaveProperty('x-header-one', 'Value One');
    expect(response.headers).toHaveProperty('x-header-two', expect.stringMatching(/^[0-9]{13}$/));
  });

  it('should be able to access multi method route', async () => {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
    for (const method of methods) {
      const response = await server.mockRequest({ method, url: '/test-all' });
      const request = (handler.mock.lastCall as any[])?.[0];
      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual(data);
      expect(contextFn).toBeCalledTimes(1);
      expect(handler).toBeCalledTimes(1);
      expect(request).not.toHaveProperty('rawBody');
      jest.clearAllMocks();
    }
  });

  it('should redirect to another route', async () => {
    const response = await server.mockRequest().get('/redirect');

    expect(response.statusCode).toBe(301);
    expect(handler).toBeCalledTimes(1);
    expect(response.headers).toHaveProperty('location', '/api/test-single');
  });

  it('should render the view', async () => {
    const response = await server.mockRequest().get('/test-render').body(body);

    expect(response.statusCode).toBe(200);
    expect(response.body).toBe('View');
    expect(handler).toBeCalledTimes(1);
    expect(renderer).toBeCalledTimes(1);
    expect(renderer).toBeCalledWith('sample', data);
  });

  it('should stop execution after response is sent', async () => {
    const data = new AppError(ErrorCode.UNEXPECTED).toObject();
    middlewares.before.mockImplementationOnce((_, res) => res.status(400).send(data));
    const response = await server.mockRequest().get('/test-all');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual(data);
    expect(middlewares.before).toHaveBeenCalledTimes(1);
    expect(middlewares.after).toHaveBeenCalledTimes(1);
    expect(handler).not.toBeCalled();
  });

  it('should handle the route with error', async () => {
    const errorHandler = jest.fn<ErrorHandler['handle']>((err: AppError, _req, res) => res.status(401).send(err.toObject()));
    config.setErrorHandler({ handle: errorHandler });
    handler.mockRejectedValueOnce(error);

    const response = await server.mockRequest().put('/test-all').body(data);
    expect(response.statusCode).toBe(401);
    expect(response.json()).toStrictEqual(error.toObject());
    expect(errorHandler).toBeCalledTimes(1);
    expect(errorHandler).toBeCalledWith(error, expect.anything(), expect.anything());
  });

  it('should stop the server', async () => {
    const mockFn = jest.fn(async () => {}) as any;
    server.getInstance().close = mockFn;

    await expect(server.stop()).resolves.toBeUndefined();
    expect(mockFn).toBeCalledTimes(1);
  });
});
