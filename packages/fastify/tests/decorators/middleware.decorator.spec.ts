/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Middleware } from '@shadow-library/fastify';

import { Utils } from '../utils';

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
    const metadata = Utils.getControllerMetadata(ValidMiddleware);
    expect(metadata).toStrictEqual({ middleware: true, generates: true, options: { type: 'preHandler', weight: 0 } });
  });
});
