/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { All, Delete, Get, Head, HttpMethod, HttpRoute, Options, Patch, Post, Put } from '@shadow-library/server';

import { Utils } from '../utils';

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
      @HttpRoute({ method: HttpMethod.GET, path })
      static execute() {}
    }

    const route = Utils.getRouteMetadata(Controller.execute);

    expect(route.path).toBe(path);
    expect(route.method).toBe(HttpMethod.GET);
  });

  it(`should set the path as '/' by default for request`, () => {
    class Controller {
      @HttpRoute({ method: HttpMethod.POST })
      static execute() {}
    }

    const route = Utils.getRouteMetadata(Controller.execute);

    expect(route.path).toBe('/');
  });

  it(`should prepend the path with '/' if not present`, () => {
    class Controller {
      @HttpRoute({ method: HttpMethod.POST, path: 'path' })
      static execute() {}
    }

    const route = Utils.getRouteMetadata(Controller.execute);

    expect(route.path).toBe('/path');
  });

  [All, Delete, Get, Head, Options, Patch, Post, Put].forEach(Decorator => {
    it(`should enhance the method with the request metadata for ${Decorator.name}`, () => {
      const path = '/data';
      class Controller {
        @Decorator(path)
        static execute() {}
      }

      const route = Utils.getRouteMetadata(Controller.execute);

      expect(route.path).toBe(path);
      expect(route.method).toBe(Decorator.name.toUpperCase());
    });
  });
});
