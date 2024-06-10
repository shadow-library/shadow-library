/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Injectable } from '@shadow-library/app';
import { INJECTABLE_WATERMARK, TRANSIENT_METADATA } from '@shadow-library/app/constants';

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
      private readonly _param: number,
      private readonly _test: string,
      private readonly _data: Data,
    ) {}
  }

  it(`should enhance component with '${INJECTABLE_WATERMARK.toString()}' metadata`, () => {
    const injectableWatermark = Reflect.getMetadata(INJECTABLE_WATERMARK, TestMiddleware);

    expect(injectableWatermark).toBe(true);
  });

  it(`should enhance component with 'design:paramtypes' metadata`, () => {
    const constructorParams = Reflect.getMetadata('design:paramtypes', TestMiddleware);

    expect(constructorParams[0]).toBe(Number);
    expect(constructorParams[1]).toBe(String);
    expect(constructorParams[2]).toBe(Data);
  });

  it(`should enhance component with '${TRANSIENT_METADATA.toString()}' metadata`, () => {
    const constructorParams = Reflect.getMetadata(TRANSIENT_METADATA, TestMiddleware);

    expect(constructorParams).toBe(true);
  });
});
