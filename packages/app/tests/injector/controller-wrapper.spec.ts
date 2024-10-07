/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Controller, PARAMTYPES_METADATA, RETURN_TYPE_METADATA, Route, RouteMetdata } from '@shadow-library/app';
import { ControllerWrapper, RouteController } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ControllerWrapper', () => {
  const controllerMetadata = { isPrivate: true };
  const routeMetadata = { op: 'POST', path: '/test' };
  const mock = jest.fn();
  let routes: RouteController<RouteMetdata>[];

  @Controller(controllerMetadata)
  class TestController {
    mock = mock;

    @Route(routeMetadata)
    test(arg1: string, arg2: number, arg3: Record<string, any>): string {
      return this.mock(arg1, arg2, arg3) as any;
    }

    @Route({ op: 'GET', path: '/test' })
    noParams(): void {}
  }

  beforeEach(() => {
    jest.clearAllMocks();
    const controller = new ControllerWrapper(TestController, []);
    routes = controller.getRoutes();
  });

  it('should throw an error if the class is not a controller', () => {
    class Test {}
    expect(() => new ControllerWrapper(Test, [])).toThrowError(InternalError);
  });

  it('should return the routes of the controller', () => {
    routes[0]?.handler('arg1', 1, {});

    expect(routes).toHaveLength(2);
    expect(routes[0]?.metadata).toStrictEqual({ ...controllerMetadata, ...routeMetadata });
    expect(mock).toHaveBeenCalledWith('arg1', 1, {});
  });

  it('should return the param types and return type of the route', () => {
    const paramtypes = Reflect.getMetadata(PARAMTYPES_METADATA, TestController.prototype, 'test');
    const returnType = Reflect.getMetadata(RETURN_TYPE_METADATA, TestController.prototype, 'test');

    expect(paramtypes).toStrictEqual([String, Number, Object]);
    expect(returnType).toBe(String);

    expect(routes[0]?.paramtypes).toStrictEqual([String, Number, Object]);
    expect(routes[0]?.returnType).toBe(String);

    expect(routes[1]?.paramtypes).toStrictEqual([]);
    expect(routes[1]?.returnType).toBeUndefined();
  });
});
