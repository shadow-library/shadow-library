/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Body, HttpInput, Params, Query, Req, Res, RouteInputType } from '@shadow-library/fastify';

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
    static multiple(@HttpInput(RouteInputType.BODY) _body: any, _random: string, @HttpInput(RouteInputType.PARAMS, schema) _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static body(_string: string, @Body() _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static params(@Params() _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static query(@Query(schema) _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static req(@Req() _req: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static res(@Res() _res: any) {}
  }

  it(`should enhance the method with the request input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.single);
    const paramtypes = Utils.getParamMetadata(Controller, 'single');

    expect(metadata).toStrictEqual({ schemas: { body: schema } });
    expect(paramtypes).toStrictEqual(['body']);
  });

  it(`should enhance the method with the Body input metadata`, () => {
    const paramtypes = Utils.getParamMetadata(Controller, 'body');
    expect(paramtypes).toStrictEqual([String, 'body']);
  });

  it(`should enhance the method with the Params input metadata`, () => {
    const paramtypes = Utils.getParamMetadata(Controller, 'params');
    expect(paramtypes).toStrictEqual(['params']);
  });

  it(`should enhance the method with the Query input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.query);
    const paramtypes = Utils.getParamMetadata(Controller, 'query');

    expect(metadata).toStrictEqual({ schemas: { query: schema } });
    expect(paramtypes).toStrictEqual(['query']);
  });

  it(`should enhance the method with the request input metadata`, () => {
    const paramtypes = Utils.getParamMetadata(Controller, 'req');
    expect(paramtypes).toStrictEqual(['request']);
  });

  it(`should enhance the method with the response input metadata`, () => {
    const paramtypes = Utils.getParamMetadata(Controller, 'res');
    expect(paramtypes).toStrictEqual(['response']);
  });

  it(`should enhance the method with the multiple request input metadata`, () => {
    const metadata = Utils.getRouteMetadata(Controller.multiple);
    const paramtypes = Utils.getParamMetadata(Controller, 'multiple');

    expect(metadata).toStrictEqual({ schemas: { params: schema } });
    expect(paramtypes).toStrictEqual(['body', String, 'params']);
  });
});
