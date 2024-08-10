/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';

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
  describe('ServerConfig', () => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    let serverConfig: ServerConfig;

    it('should create a new instance', () => {
      serverConfig = new ServerConfig();
      expect(serverConfig).toBeInstanceOf(ServerConfig);
    });

    it('should have default values', () => {
      expect(serverConfig.getPort()).toBe(8080);
      expect(serverConfig.getHostname()).toBe('127.0.0.1');
      expect(serverConfig.getRouterConfig()).toStrictEqual({ ignoreTrailingSlash: true, maxParamLength: 100 });
    });

    it('should have default error handler handle error', () => {
      /** @ts-expect-error test args */
      serverConfig.getErrorHandler().handle(new Error('Test Error'), {}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('{"message":"Test Error"}');
    });

    it('should have default error handler handle unknown', () => {
      /** @ts-expect-error test args */
      serverConfig.getErrorHandler().handle({}, {}, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith('{"message":"Unknown Error"}');
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
      serverConfig.setRouterConfig('ignoreDuplicateSlashes', true);
      expect(serverConfig.getRouterConfig()).toHaveProperty('ignoreTrailingSlash', true);
    });

    it('should set and get the error handler', () => {
      const errorHandler = jest.fn() as any;
      serverConfig.setErrorHandler(errorHandler);
      expect(serverConfig.getErrorHandler()).toBe(errorHandler);
    });
  });
});
