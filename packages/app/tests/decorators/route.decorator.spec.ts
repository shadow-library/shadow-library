/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Route } from '@shadow-library/app';
import { ROUTE_RULES_METADATA, ROUTE_WATERMARK } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('RouteDecorator', () => {
  const routeRuleOne = { method: 'GET', auth: { jwt: true } };
  const routeRuleTwo = { path: '/users', auth: { oauth: true } };
  class CatController {
    @Route(routeRuleOne)
    methodOne() {}

    @Route(routeRuleOne)
    @Route(routeRuleTwo)
    methodTwo() {}
  }

  const controller = new CatController();

  it('should mark as route method', () => {
    const metadata = Reflect.getMetadata(ROUTE_WATERMARK, controller.methodOne);
    expect(metadata).toBe(true);
  });

  it('should set route rules', () => {
    const metadata = Reflect.getMetadata(ROUTE_RULES_METADATA, controller.methodOne);
    expect(metadata).toEqual(routeRuleOne);
  });

  it('should append route rules', () => {
    const metadata = Reflect.getMetadata(ROUTE_RULES_METADATA, controller.methodTwo);
    expect(metadata).toStrictEqual({ method: 'GET', path: '/users', auth: { jwt: true, oauth: true } });
  });
});
