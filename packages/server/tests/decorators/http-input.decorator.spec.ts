/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Body, HttpInput, Params, Query, RouteInputType } from '@shadow-library/server';
import { ROUTE_INPUT_METADATA } from '@shadow-library/server/constants';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Input Decorators', () => {
  const schema = { type: 'string' } as any;
  class Controller {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static single(@HttpInput(RouteInputType.BODY, schema) _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static multiple(@HttpInput(RouteInputType.BODY) _body: any, @HttpInput(RouteInputType.PARAMS, schema) _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static body(_string: string, @Body() _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static params(@Params() _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static query(@Query(schema) _params: any) {}
  }

  it(`should enhance the method with the request input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'single');
    const metadata = Utils.getRouteMetadata(Controller.single);

    expect(input).toStrictEqual({ body: 0 });
    expect(metadata).toStrictEqual({ schemas: { body: schema } });
  });

  it(`should enhance the method with the Body input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'body');
    const metadata = Utils.getRouteMetadata(Controller.body);

    expect(input).toStrictEqual({ body: 1 });
    expect(metadata).toBeUndefined();
  });

  it(`should enhance the method with the Params input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'params');
    const metadata = Utils.getRouteMetadata(Controller.params);

    expect(input).toStrictEqual({ params: 0 });
    expect(metadata).toBeUndefined();
  });

  it(`should enhance the method with the Query input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'query');
    const metadata = Utils.getRouteMetadata(Controller.query);

    expect(input).toStrictEqual({ query: 0 });
    expect(metadata).toStrictEqual({ schemas: { query: schema } });
  });

  it(`should enhance the method with the multiple request input metadata`, () => {
    const input = Reflect.getMetadata(ROUTE_INPUT_METADATA, Controller, 'multiple');
    const metadata = Utils.getRouteMetadata(Controller.multiple);

    expect(input).toStrictEqual({ body: 0, params: 1 });
    expect(metadata).toStrictEqual({ schemas: { params: schema } });
  });
});
