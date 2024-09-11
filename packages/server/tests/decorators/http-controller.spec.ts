/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { HttpController } from '@shadow-library/server';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@HttpController', () => {
  it(`should enhance the class with the base path metadata`, () => {
    @HttpController('/test')
    class TestController {}
    const metadata = Utils.getRouteMetadata(TestController);
    expect(metadata).toStrictEqual({ basePath: '/test' });
  });
});
