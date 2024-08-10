/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Body, HttpInput, Params, Query, RouteInputType } from '@shadow-library/server';

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
    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ args: { body: 0 }, schemas: { body: schema } });
  });

  it(`should enhance the method with the Body input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.body);
    expect(metadata).toStrictEqual({ args: { body: 1 } });
  });

  it(`should enhance the method with the Params input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.params);
    expect(metadata).toStrictEqual({ args: { params: 0 } });
  });

  it(`should enhance the method with the Query input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.query);
    expect(metadata).toStrictEqual({ args: { query: 0 }, schemas: { query: schema } });
  });

  it(`should enhance the method with the multiple request input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.multiple);
    expect(metadata).toStrictEqual({ args: { body: 0, params: 1 }, schemas: { params: schema } });
  });
});
