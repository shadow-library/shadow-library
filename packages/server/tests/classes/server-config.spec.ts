/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ServerConfig } from '@shadow-library/server';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('ServerConfig', () => {
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  let serverConfig: ServerConfig;

  beforeEach(() => {
    serverConfig = new ServerConfig();
    jest.clearAllMocks();
  });

  it('should have default values', () => {
    expect(serverConfig.getPort()).toBe(8080);
    expect(serverConfig.getHostname()).toBe('127.0.0.1');
    expect(serverConfig.getServerOptions()).toStrictEqual({
      ignoreTrailingSlash: true,
      genReqId: expect.any(Function),
      ajv: { customOptions: { allErrors: true, removeAdditional: true, useDefaults: true } },
    });

    expect(serverConfig.getServerOptions()?.genReqId?.({} as any)).toMatch(uuidRegex);
  });

  it('should have default error handler handle error', () => {
    /** @ts-expect-error test args */
    serverConfig.getErrorHandler().handle(new Error('Test Error'), {}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: 'Test Error' });
  });

  it('should have default error handler handle unknown', () => {
    /** @ts-expect-error test args */
    serverConfig.getErrorHandler().handle({}, {}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });

  it('should set and get the port', () => {
    const port = 9090;
    serverConfig.setPort(port);
    expect(serverConfig.getPort()).toBe(port);
  });

  it('should set and get the hostname', () => {
    const hostname = 'example.com';
    serverConfig.setHostname(hostname);
    expect(serverConfig.getHostname()).toBe(hostname);
  });

  it('should set and get the router config', () => {
    serverConfig.setServerOption('bodyLimit', 100);
    expect(serverConfig.getServerOptions()).toHaveProperty('bodyLimit', 100);
  });

  it('should set and get the error handler', () => {
    const errorHandler = { handle: jest.fn() };
    serverConfig.setErrorHandler(errorHandler);
    expect(serverConfig.getErrorHandler()).toBe(errorHandler);
  });

  it('should set and get the global response schema', () => {
    const responseSchema = { type: 'object' } as any;
    serverConfig.addGlobalResponseSchema(200, responseSchema);

    expect(serverConfig.getGlobalResponseSchema(200)).toBe(responseSchema);
    expect(serverConfig.getGlobalResponseSchema()).toStrictEqual({ 200: responseSchema });
  });

  it('should add default error schema', () => {
    const fn = jest.spyOn(serverConfig, 'addGlobalResponseSchema');
    serverConfig.addDefaultErrorSchema(500);
    expect(fn).toBeCalledWith(500, expect.any(Object));
  });
});
