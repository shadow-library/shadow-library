/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Route } from '@shadow-library/app';
import { ROUTE_METADATA, ROUTE_WATERMARK } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('RouteDecorator', () => {
  const routeMetadataOne = { op: 'GET', auth: { jwt: true } };
  const routeMetadataTwo = { path: '/users', auth: { oauth: true } };
  class CatController {
    @Route(routeMetadataOne)
    methodOne() {}

    @Route(routeMetadataOne)
    @Route(routeMetadataTwo)
    methodTwo() {}

    @Route()
    methodThree() {}
  }

  const controller = new CatController();

  it('should mark as route method', () => {
    const metadata = Reflect.getMetadata(ROUTE_WATERMARK, controller.methodOne);
    expect(metadata).toBe(true);
  });

  it('should set route metadata', () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, controller.methodOne);
    expect(metadata).toEqual(routeMetadataOne);
  });

  it('should set default route metadata', () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, controller.methodThree);
    expect(metadata).toStrictEqual({});
  });

  it('should append route metadata', () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, controller.methodTwo);
    expect(metadata).toStrictEqual({ op: 'GET', path: '/users', auth: { jwt: true, oauth: true } });
  });
});
