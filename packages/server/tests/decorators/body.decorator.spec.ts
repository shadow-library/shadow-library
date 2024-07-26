/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Body } from '@shadow-library/server';
import { BODY_PARAMETER } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Body', () => {
  class Controller {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    methodOne(_param1: string, @Body() _body: object, _param3: string) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    methodTwo(@Body() _bodyOne: object, _param1: string, @Body() _bodyTwo: object) {}
  }

  const controller = new Controller();

  it('should decorate the method parameter with the body index', () => {
    const index = Reflect.getMetadata(BODY_PARAMETER, controller, 'methodOne');
    expect(index).toBe(1);
  });

  it('should decorate the method parameter with the first body index', () => {
    const index = Reflect.getMetadata(BODY_PARAMETER, controller, 'methodTwo');
    expect(index).toBe(0);
  });
});
