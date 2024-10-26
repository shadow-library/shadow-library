/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { CONTROLLER_METADATA } from '@shadow-library/app/constants';

/**
 * Importing user defined packages
 */
import { HttpController } from '@shadow-library/fastify';
import { HTTP_CONTROLLER_TYPE } from '@shadow-library/fastify/constants';

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
    const metadata = Reflect.getMetadata(CONTROLLER_METADATA, TestController);
    expect(metadata).toStrictEqual({ path: '/test', [HTTP_CONTROLLER_TYPE]: 'router' });
  });

  it(`should enhance the class with the default path metadata`, () => {
    @HttpController()
    class TestController {}
    const metadata = Reflect.getMetadata(CONTROLLER_METADATA, TestController);
    expect(metadata).toStrictEqual({ path: '', [HTTP_CONTROLLER_TYPE]: 'router' });
  });
});
