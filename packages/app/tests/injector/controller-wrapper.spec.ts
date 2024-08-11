/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Controller, Route } from '@shadow-library/app';
import { ControllerWrapper } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ControllerWrapper', () => {
  const controllerMetadata = { isPrivate: true };
  const routeMetadata = { method: 'POST', path: '/test' };
  const mock = jest.fn();
  @Controller(controllerMetadata)
  class TestController {
    mock = mock;

    @Route(routeMetadata)
    test(arg1: string, arg2: number, arg3: Record<string, any>): string {
      return this.mock(arg1, arg2, arg3) as any;
    }

    @Route({ method: 'GET', path: '/test' })
    noParams(): void {}
  }
  const controller = new ControllerWrapper(TestController, []);
  const routes = controller.getRoutes();

  it('should throw an error if the class is not a controller', () => {
    class Test {}
    expect(() => new ControllerWrapper(Test, [])).toThrowError(`Class 'Test' is not a controller`);
  });

  it('should return the routes of the controller', () => {
    routes[0]?.handler('arg1', 1, {});

    expect(routes).toHaveLength(2);
    expect(routes[0]?.metadata).toStrictEqual({ ...controllerMetadata, ...routeMetadata });
    expect(mock).toHaveBeenCalledWith('arg1', 1, {});
  });

  it('should return the param types and return type of the route', () => {
    expect(routes[0]?.paramtypes).toStrictEqual([String, Number, Object]);
    expect(routes[0]?.returnType).toBe(String);

    expect(routes[1]?.paramtypes).toStrictEqual([]);
    expect(routes[1]?.returnType).toBeUndefined();
  });
});
