/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { applyDecorators } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('applyDecorators', () => {
  function testDecorator1(param: number): ClassDecorator {
    return (target: any) => {
      target.myParam = param;
    };
  }

  function testDecorator2(param1: number, param2: number): ClassDecorator {
    return (target: any) => {
      target.myParam = (target.myParam || 0) + param1;
      target.myParam2 = param2;
    };
  }

  function testDecorator3(): ClassDecorator {
    return (target: any) => {
      target.myParam3 = 0;
    };
  }

  it('should apply all decorators', () => {
    const testParams = {
      decorator1: { param: 1 },
      decorator2: { param1: 2, param2: 3 },
    };

    @testDecorator3()
    @testDecorator2(testParams.decorator2.param1, testParams.decorator2.param2)
    @testDecorator1(testParams.decorator1.param)
    class ClassOne {}

    const customDecorator = applyDecorators(
      testDecorator1(testParams.decorator1.param),
      testDecorator2(testParams.decorator2.param1, testParams.decorator2.param2),
      testDecorator3(),
    ) as ClassDecorator;

    @customDecorator
    class ClassTwo {}

    [ClassOne, ClassTwo].forEach(Class => {
      expect(Class).toHaveProperty('myParam', testParams.decorator1.param + testParams.decorator2.param1);
      expect(Class).toHaveProperty('myParam2', testParams.decorator2.param2);
      expect(Class).toHaveProperty('myParam3', 0);
    });
  });
});
