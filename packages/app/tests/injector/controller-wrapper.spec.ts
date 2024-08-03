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
  it('should throw an error if the class is not a controller', () => {
    class Test {}
    expect(() => new ControllerWrapper(Test, [])).toThrowError(`Class 'Test' is not a controller`);
  });

  it('should return the routes of the controller', () => {
    const controllerMetadata = { isPrivate: true };
    const routeMetadata = { method: 'POST', path: '/test' };
    const mock = jest.fn();
    @Controller(controllerMetadata)
    class TestController {
      mock = mock;

      @Route(routeMetadata)
      test(...args: string[]) {
        return this.mock(...args);
      }
    }

    const controller = new ControllerWrapper(TestController, []);
    const routes = controller.getRoutes();
    routes[0]?.handler('arg1', 'arg2');

    expect(routes).toHaveLength(1);
    expect(routes[0]?.metadata).toStrictEqual({ ...controllerMetadata, ...routeMetadata });
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith('arg1', 'arg2');
  });
});
