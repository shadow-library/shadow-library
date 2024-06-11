/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { SetMetadata } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@SetMetadata', () => {
  const [key, value] = ['key', 'value'];

  @SetMetadata(key, value)
  class Test {}

  class TestWithMethod {
    @SetMetadata(key, value)
    public static test() {}
  }

  it('should enhance class with expected metadata', () => {
    const metadata = Reflect.getMetadata(key, Test);
    expect(metadata).toBe(value);
  });

  it('should enhance method with expected metadata', () => {
    const metadata = Reflect.getMetadata(key, TestWithMethod.test);
    expect(metadata).toBe(value);
  });
});
