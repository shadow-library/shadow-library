/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Injectable } from '@shadow-library/app';
import { INJECTABLE_METADATA } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Injectable', () => {
  class Data {}

  @Injectable({ transient: true })
  class TestMiddleware {
    constructor(
      readonly param: number,
      readonly test: string,
      readonly data: Data,
    ) {}
  }

  it(`should enhance component with '${INJECTABLE_METADATA.toString()}' metadata`, () => {
    const injectableWatermark = Reflect.getMetadata(INJECTABLE_METADATA, TestMiddleware);
    expect(injectableWatermark).toStrictEqual({ transient: true });
  });

  it(`should enhance component with 'design:paramtypes' metadata`, () => {
    const constructorParams = Reflect.getMetadata('design:paramtypes', TestMiddleware);

    expect(constructorParams[0]).toBe(Number);
    expect(constructorParams[1]).toBe(String);
    expect(constructorParams[2]).toBe(Data);
  });
});
