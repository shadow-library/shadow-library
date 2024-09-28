/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppError, ErrorCode } from '@shadow-library/common';
import { Type } from '@sinclair/typebox';

/**
 * Importing user defined packages
 */
import { HttpMethod, MiddlewareHandler, ServerConfig, ShadowServer } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Shadow Server Routing', () => {
  const body = { search: 'test' };
  const data = { template: 'sample', data: { msg: 'Hello World' } };
  const error = new AppError(ErrorCode.UNKNOWN);

  const renderer = jest.fn();
  const handler = jest.fn(async () => data);
  const middlewares = { before: jest.fn<MiddlewareHandler>(async () => {}), after: jest.fn<MiddlewareHandler>(async () => {}) };
  let server: ShadowServer;

  beforeEach(async () => {
    jest.clearAllMocks();
    const config = new ServerConfig();
    server = new ShadowServer(config);
    const router = server.getRouter();
    const instance = server.getInstance();

    instance.decorateReply('viewAsync', function (this: any, ...args: unknown[]) {
      renderer(...args);
      return this.send('View');
    });

    const schema = Type.Object({});
    const schemas = { body: schema, query: schema, params: schema };
    const headers = { 'X-Header-One': 'Value One', 'X-Header-Two': () => Date.now().toString() };
    const single = { method: HttpMethod.POST, basePath: '/api', path: '/test-single', headers, rawBody: true, schemas };
    router.register({ metadata: single, handler, paramtypes: ['request', 'query', String, 'body'] });

    const multiple = { method: HttpMethod.ALL, path: '/test-all' };
    router.register({ metadata: multiple, handler, paramtypes: ['request'] });

    const redirect = { method: HttpMethod.GET, path: '/redirect', redirect: '/api/test-single' };
    router.register({ metadata: redirect, handler, paramtypes: [] });

    const render = { method: HttpMethod.GET, path: '/test-render', render: true } as const;
    router.register({ metadata: render, handler, paramtypes: [] });

    const options = { type: 'preHandler', weight: 0 };
    const middleware = { [MIDDLEWARE_WATERMARK]: true, target: Object, generates: true, options } as const;
    const afterMiddleware = { ...middleware, generates: false, options: { ...options, type: 'onResponse' } } as const;
    router.register({ metadata: middleware, handler: () => middlewares.before, paramtypes: [] });
    router.register({ metadata: middleware, handler: () => null, paramtypes: [] });
    router.register({ metadata: afterMiddleware, handler: middlewares.after, paramtypes: [] });

    server.init();
  });

  const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'] as const;
  methods.forEach(method => {
    it(`should handle ${method} route`, async () => {
      const response = await server.mockRequest({ method, url: '/test-all' });
      const request = (handler.mock.lastCall as any[])?.[0];
      expect(response.statusCode).toBe(200);
      expect(response.json()).toStrictEqual(data);
      expect(handler).toBeCalledTimes(1);
      expect(request).not.toHaveProperty('rawBody');
    });
  });

  it('should handle unknown route', async () => {
    const response = await server.mockRequest().get('/not-found');
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ code: 'S002', message: 'Not Found', type: 'NOT_FOUND' });
  });

  it('should set the response metadata', async () => {
    const response = await server.mockRequest().post('/api/test-single?id=123').body(body);
    expect(response.statusCode).toBe(201);
    expect(response.json()).toStrictEqual(data);

    expect(handler).toBeCalledTimes(1);
    expect(middlewares.before).toBeCalledTimes(1);
    expect(middlewares.after).toBeCalledTimes(1);
    expect(handler).toBeCalledWith(expect.objectContaining({ rawBody: expect.any(Buffer) }), { id: '123' }, null, body);

    expect(response.headers).toHaveProperty('x-header-one', 'Value One');
    expect(response.headers).toHaveProperty('x-header-two', expect.stringMatching(/^[0-9]{13}$/));
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
    expect(renderer).toBeCalledWith(data.template, data.data);
  });

  it('should stop execution after response is sent', async () => {
    const data = new AppError(ErrorCode.UNEXPECTED).toObject();
    middlewares.before.mockImplementationOnce(async (_, res) => res.status(400).send(data));
    const response = await server.mockRequest().get('/test-all');

    expect(response.statusCode).toBe(400);
    expect(response.json()).toStrictEqual(data);
    expect(middlewares.before).toHaveBeenCalledTimes(1);
    expect(middlewares.after).toHaveBeenCalledTimes(1);
    expect(handler).not.toBeCalled();
  });

  it('should handle the route with error', async () => {
    handler.mockRejectedValueOnce(error);

    const response = await server.mockRequest().put('/test-all').body(data);
    expect(response.statusCode).toBe(500);
    expect(response.json()).toStrictEqual(error.toObject());
  });
});
