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
    let serverConfig: ServerConfig;

    it('should create a new instance', () => {
      serverConfig = new ServerConfig();
      expect(serverConfig).toBeInstanceOf(ServerConfig);
    });

    it('should have default values', () => {
      expect(serverConfig.getPort()).toBe(8080);
      expect(serverConfig.getHostname()).toBe('127.0.0.1');
      expect(serverConfig.getRouterConfig()).toStrictEqual({
        ignoreTrailingSlash: true,
        caseSensitive: true,
        maxParamLength: 100,
        defaultRoute: expect.any(Function),
      });
    });

    it('should have default route handler', () => {
      const thisFn = () => jest.fn().mockReturnThis();
      const res = { writeHead: thisFn(), end: thisFn() };
      serverConfig.getRouterConfig().defaultRoute({} as any, res as any);

      expect(res.writeHead).toHaveBeenCalledWith(404, { 'Content-Type': 'application/json', 'Content-Length': expect.any(Number) });
      expect(res.end).toHaveBeenCalledWith(expect.any(Buffer));
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
  });
});
