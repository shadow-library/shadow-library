/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { HTTPController } from '@shadow-library/server';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@HTTPController', () => {
  it(`should enhance the class with the base path metadata`, () => {
    @HTTPController('/test')
    class TestController {}
    const metadata = Utils.getRouteMetadata(TestController);
    expect(metadata).toStrictEqual({ basePath: '/test' });
  });
});
