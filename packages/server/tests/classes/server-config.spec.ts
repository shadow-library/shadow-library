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

describe('ServerConfig', () => {
  const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
  let serverConfig: ServerConfig;

  beforeEach(() => {
    res.status.mockClear();
    res.send.mockClear();
  });

  it('should create a new instance', () => {
    serverConfig = new ServerConfig();
    expect(serverConfig).toBeInstanceOf(ServerConfig);
  });

  it('should have default values', () => {
    expect(serverConfig.getPort()).toBe(8080);
    expect(serverConfig.getHostname()).toBe('127.0.0.1');
    expect(serverConfig.getServerConfig()).toStrictEqual({ ignoreTrailingSlash: true });
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
    serverConfig.setServerConfig('bodyLimit', 100);
    expect(serverConfig.getServerConfig()).toHaveProperty('bodyLimit', 100);
  });

  it('should set and get the error handler', () => {
    const errorHandler = { handle: jest.fn() };
    serverConfig.setErrorHandler(errorHandler);
    expect(serverConfig.getErrorHandler()).toBe(errorHandler);
  });

  it('should set and get the global response schema', () => {
    const responseSchema = { schema: { type: 'object' } } as any;
    serverConfig.addGlobalResponseSchema(200, responseSchema);

    expect(serverConfig.getGlobalResponseSchema(200)).toBe(responseSchema);
    expect(serverConfig.getGlobalResponseSchema()).toStrictEqual({ 200: responseSchema });
  });
});
