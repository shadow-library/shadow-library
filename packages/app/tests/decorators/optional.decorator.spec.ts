/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Optional } from '@shadow-library/app';
import { OPTIONAL_DEPS_METADATA } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Optional', () => {
  class Token {}
  class Test {
    constructor(
      private param: string,
      @Optional() private token: Token,
    ) {}
  }

  it('should enhance class with expected constructor params metadata', () => {
    const metadata = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, Test);
    expect(metadata).toStrictEqual([1]);
  });
});
