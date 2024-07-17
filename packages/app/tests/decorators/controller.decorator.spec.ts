/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Controller } from '@shadow-library/app';
import { CONTROLLER_WATERMARK, ROUTE_RULES_METADATA } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@controller', () => {
  const rules = { action: 'controller-action-rule' };

  @Controller(rules)
  class TestController {}

  it(`should enhance component with '${CONTROLLER_WATERMARK.toString()}' metadata`, () => {
    const controllerWatermark = Reflect.getMetadata(CONTROLLER_WATERMARK, TestController);

    expect(controllerWatermark).toBe(true);
  });

  it('should set action rules', () => {
    const routeRules = Reflect.getMetadata(ROUTE_RULES_METADATA, TestController);

    expect(routeRules).toStrictEqual(rules);
  });
});
