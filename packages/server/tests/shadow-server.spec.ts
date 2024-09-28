/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError, ValidationError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { ServerConfig, ServerError, ShadowServer } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
jest.mock('fastify', () => ({
  fastify: jest.fn().mockReturnValue({
    setNotFoundHandler: jest.fn(),
    setErrorHandler: jest.fn(),
    setSchemaErrorFormatter: jest.fn(),

    getDefaultJsonParser: jest.fn(),
    addContentTypeParser: jest.fn(),
    addHook: jest.fn(),

    route: jest.fn(),
    listen: jest.fn(),
    close: jest.fn(),
  }),
}));

describe('Shadow Server', () => {
  const request = { body: {}, params: {}, query: {} } as any;
  const response = { send: jest.fn() } as any;

  it('should create the object and fastify instance', () => {
    const config = new ServerConfig();
    const server = new ShadowServer(config);
    const instance = server.getInstance();

    expect(server).toBeInstanceOf(ShadowServer);
    expect(instance).toBeDefined();
    expect(instance.setNotFoundHandler).toHaveBeenCalled();
    expect(instance.setErrorHandler).toHaveBeenCalled();
    expect(instance.setSchemaErrorFormatter).toHaveBeenCalled();
  });

  describe('error handlers', () => {
    let server: ShadowServer;

    beforeEach(() => {
      jest.clearAllMocks();
      const config = new ServerConfig();
      server = new ShadowServer(config);
    });

    it('should handle not found error', () => {
      const mock = jest.fn();
      jest.spyOn(server['config'], 'getErrorHandler').mockReturnValue({ handle: mock });

      server['getDefaultRouteHandler']()(request, response);

      expect(mock).toHaveBeenCalledWith(expect.any(ServerError), request, response);
    });

    it('should format the schema errors', () => {
      const errors = [{ instancePath: '', message: "must have property 'password'" }, { instancePath: '/email' }];
      const formattedError = server['formatSchemaErrors'](errors as any, 'body');

      expect(formattedError).toBeInstanceOf(ValidationError);
      expect(formattedError.getErrors()).toStrictEqual([
        { field: 'body', msg: `must have property 'password'` },
        { field: 'body.email', msg: 'Field validation failed' },
      ]);
    });
  });

  describe('hooks and route registertion', () => {
    let server: ShadowServer;

    beforeEach(() => {
      jest.clearAllMocks();
      const config = new ServerConfig();
      server = new ShadowServer(config);
    });

    it('should return the router', () => {
      const register = jest.spyOn(server as any, 'register');

      const router = server.getRouter();
      router.register({ metadata: {} } as any);

      expect(router).toBeDefined();
      expect(register).toHaveBeenCalled();
      expect(router.identifier).toBeDefined();
    });

    it('should throw an error if route or middleware is registered after server initialization', () => {
      server['inited'] = true;
      const route = { metadata: {} } as any;
      expect(() => server['register'](route)).toThrowError(InternalError);
    });

    it('should register the route', () => {
      const middlewares = jest.spyOn(server['middlewares'], 'push');
      const routes = jest.spyOn(server['routes'], 'push');

      const route = { metadata: {} } as any;
      server['register'](route);

      expect(middlewares).not.toHaveBeenCalled();
      expect(routes).toHaveBeenCalledWith(route);
    });

    it('should register the middleware', () => {
      const middlewares = jest.spyOn(server['middlewares'], 'push');
      const routes = jest.spyOn(server['routes'], 'push');

      const route = { metadata: { [MIDDLEWARE_WATERMARK]: true } } as any;
      server['register'](route);

      expect(routes).not.toHaveBeenCalled();
      expect(middlewares).toHaveBeenCalledWith(route);
    });

    it('should register raw body parser', () => {
      const request = { routeOptions: { config: { metadata: { rawBody: true } } } } as any;
      const buffer = Buffer.from('{"key": "value"}');
      const instance = server.getInstance();
      const done = () => {};
      const parser = jest.fn();
      jest.mocked(instance.getDefaultJsonParser).mockReturnValue(parser);

      server['registerRawBody']();
      const handler = jest.mocked(instance.addContentTypeParser).mock.lastCall?.[2];
      handler?.(request, buffer, done);

      expect(instance.addContentTypeParser).toHaveBeenCalledWith('application/json', { parseAs: 'buffer' }, expect.any(Function));
      expect(parser).toHaveBeenCalledWith(request, buffer.toString(), done);
      expect(request.rawBody).toBe(buffer);
    });
  });

  describe('start and termination', () => {
    let server: ShadowServer;

    beforeEach(() => {
      jest.clearAllMocks();
      const config = new ServerConfig();
      server = new ShadowServer(config);
    });

    it('should initiate the server before staring', async () => {
      const init = jest.spyOn(server, 'init');
      const instance = server.getInstance();
      const listen = jest.spyOn(instance, 'listen');

      await server.start();

      expect(init).toHaveBeenCalled();
      expect(listen).toHaveBeenCalled();
    });

    it('should return if the server is already initialized', async () => {
      const fn = jest.spyOn(server['routes'], 'some');
      server['inited'] = true;

      await server.init();

      expect(fn).not.toHaveBeenCalled();
    });

    it('should start the server', () => {
      server['inited'] = true;
      const init = jest.spyOn(server, 'init');
      const instance = server.getInstance();
      const listen = jest.spyOn(instance, 'listen');

      server.start();

      expect(init).not.toHaveBeenCalled();
      expect(listen).toHaveBeenCalled();
    });

    it('should stop the server', () => {
      const instance = server.getInstance();
      const close = jest.spyOn(instance, 'close');

      server.stop();

      expect(close).toHaveBeenCalled();
    });
  });
});
