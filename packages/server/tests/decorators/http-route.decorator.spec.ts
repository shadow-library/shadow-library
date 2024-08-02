/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { All, Delete, Get, Head, HttpMethod, Options, Patch, Post, Put, Route, Search } from '@shadow-library/server';
import { ROUTE_METADATA } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Methods Decorators', () => {
  it(`should enhance the method with the request metadata`, () => {
    const path = '/data';
    class Controller {
      @Route({ method: HttpMethod.GET, path })
      static execute() {}
    }

    const route = Reflect.getMetadata(ROUTE_METADATA, Controller.execute);

    expect(route.path).toBe(path);
    expect(route.method).toBe(HttpMethod.GET);
  });

  it(`should set the path as '/' by default for request`, () => {
    class Controller {
      @Route({ method: HttpMethod.POST })
      static execute() {}
    }

    const route = Reflect.getMetadata(ROUTE_METADATA, Controller.execute);

    expect(route.path).toBe('/');
  });

  [All, Delete, Get, Head, Options, Patch, Post, Put, Search].forEach(Decorator => {
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
