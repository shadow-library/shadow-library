/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Middleware } from '@shadow-library/server';
import { MIDDLEWARE_WATERMARK } from '@shadow-library/server/constants';

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
    const middleware = new ValidMiddleware();
    const metadata = Utils.getRouteMetadata(ValidMiddleware);
    const routeMetadata = Utils.getRouteMetadata(middleware.generate);

    expect(routeMetadata).toStrictEqual({});
    expect(metadata).toStrictEqual({
      [MIDDLEWARE_WATERMARK]: true,
      target: ValidMiddleware,
      generates: true,
      options: { type: 'before', weight: 0 },
    });
  });
});
