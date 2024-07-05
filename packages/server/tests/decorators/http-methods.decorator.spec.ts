/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Delete, Get, Head, HttpMethod, Options, Patch, Post, Put, Search } from '@shadow-library/server';
import { METHOD_METADATA, PATH_METADATA } from '@shadow-library/server/constants';

/**
 * Defining types
 */

interface TestData {
  name: string;
  decorator: (path?: string) => MethodDecorator;
  method: HttpMethod;
}

/**
 * Declaring the constants
 */
const testData: TestData[] = [
  { name: 'GET', decorator: Get, method: HttpMethod.GET },
  { name: 'POST', decorator: Post, method: HttpMethod.POST },
  { name: 'PUT', decorator: Put, method: HttpMethod.PUT },
  { name: 'DELETE', decorator: Delete, method: HttpMethod.DELETE },
  { name: 'HEAD', decorator: Head, method: HttpMethod.HEAD },
  { name: 'OPTIONS', decorator: Options, method: HttpMethod.OPTIONS },
  { name: 'PATCH', decorator: Patch, method: HttpMethod.PATCH },
  { name: 'SEARCH', decorator: Search, method: HttpMethod.SEARCH },
];

describe('Http Methods Decorators', () => {
  testData.forEach(({ name, decorator, method }) => {
    it(`should enhance the method with the ${name} request metadata`, () => {
      class Route {
        @decorator('/data')
        static execute() {}
      }

      const actualPath = Reflect.getMetadata(PATH_METADATA, Route.execute);
      const actualMethod = Reflect.getMetadata(METHOD_METADATA, Route.execute);

      expect(actualPath).toBe('/data');
      expect(actualMethod).toBe(method);
    });

    it(`should set the path as '/' by default for ${name} request`, () => {
      class Route {
        @decorator()
        static execute() {}
      }

      const path = Reflect.getMetadata(PATH_METADATA, Route.execute);

      expect(path).toBe('/');
    });
  });
});
