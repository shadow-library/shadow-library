/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { CONTROLLER_METADATA } from '@shadow-library/app/constants';

/**
 * Importing user defined packages
 */
import { Middleware } from '@shadow-library/fastify';
import { HTTP_CONTROLLER_TYPE } from '@shadow-library/fastify/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Middleware', () => {
  @Middleware()
  class ValidMiddleware {
    generate(): void {}
  }

  it('should throw an error when applying decorator to a class without a "generate()" method', () => {
    expect(() => {
      @Middleware()
      class InvalidMiddleware {}
      return InvalidMiddleware;
    }).toThrowError();
  });

  it('should mark the class as middleware', () => {
    const metadata = Reflect.getMetadata(CONTROLLER_METADATA, ValidMiddleware);
    expect(metadata).toStrictEqual({ [HTTP_CONTROLLER_TYPE]: 'middleware', generates: true, type: 'preHandler', weight: 0 });
  });
});
