/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { ROUTE_METADATA } from '@shadow-library/app/constants';

/**
 * Importing user defined packages
 */
import { All, Delete, Get, Head, Options, Patch, Post, Put } from '@shadow-library/fastify';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Methods Decorators', () => {
  [All, Delete, Get, Head, Options, Patch, Post, Put].forEach(Decorator => {
    it(`should enhance the method with the request metadata for ${Decorator.name}`, () => {
      const path = '/data';
      class Controller {
        @Decorator(path)
        static execute() {}
      }

      const route = Reflect.getMetadata(ROUTE_METADATA, Controller.execute);

      expect(route.path).toBe(path);
      expect(route.method).toBe(Decorator.name.toUpperCase());
    });
  });
});
