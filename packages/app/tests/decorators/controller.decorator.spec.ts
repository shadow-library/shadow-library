/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Controller } from '@shadow-library/app';
import { CONTROLLER_WATERMARK, ROUTE_METADATA } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@controller', () => {
  const metadata = { action: 'controller-action' };

  @Controller(metadata)
  class TestController {}

  it(`should enhance component with '${CONTROLLER_WATERMARK.toString()}' metadata`, () => {
    const controllerWatermark = Reflect.getMetadata(CONTROLLER_WATERMARK, TestController);

    expect(controllerWatermark).toBe(true);
  });

  it('should set action metadata', () => {
    const routeMetadata = Reflect.getMetadata(ROUTE_METADATA, TestController);

    expect(routeMetadata).toStrictEqual(metadata);
  });
});
