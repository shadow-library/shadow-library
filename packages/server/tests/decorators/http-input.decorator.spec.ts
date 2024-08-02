/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Body, Params, Query, RouteInput, RouteInputType } from '@shadow-library/server';
import { ROUTE_INPUT_METADATA } from '@shadow-library/server/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Input Decorators', () => {
  const schema = {} as any;
  class Controller {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static single(@RouteInput(RouteInputType.BODY, schema) _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static multiple(@RouteInput(RouteInputType.BODY) _body: any, @RouteInput(RouteInputType.PARAMS, schema) _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static body(_string: string, @Body() _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static params(@Params() _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static query(@Query(schema) _params: any) {}
  }

  it(`should enhance the method with the request input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'single');

    expect(input).toBeInstanceOf(Array);
    expect(input).toHaveLength(1);
    expect(input).toStrictEqual([{ type: RouteInputType.BODY, index: 0, schema }]);
  });

  it(`should enhance the method with the Body input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'body');

    expect(input).toBeInstanceOf(Array);
    expect(input).toHaveLength(1);
    expect(input).toStrictEqual([{ type: RouteInputType.BODY, index: 1 }]);
  });

  it(`should enhance the method with the Params input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'params');

    expect(input).toBeInstanceOf(Array);
    expect(input).toHaveLength(1);
    expect(input).toStrictEqual([{ type: RouteInputType.PARAMS, index: 0 }]);
  });

  it(`should enhance the method with the Query input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'query');

    expect(input).toBeInstanceOf(Array);
    expect(input).toHaveLength(1);
    expect(input).toStrictEqual([{ type: RouteInputType.QUERY, index: 0, schema }]);
  });

  it(`should enhance the method with the multiple request input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'multiple');

    expect(input).toBeInstanceOf(Array);
    expect(input).toHaveLength(2);
    expect(input).toStrictEqual([
      { type: RouteInputType.PARAMS, index: 1, schema },
      { type: RouteInputType.BODY, index: 0 },
    ]);
  });
});
