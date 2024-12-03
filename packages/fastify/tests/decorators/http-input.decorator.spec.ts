/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { ROUTE_METADATA } from '@shadow-library/app/constants';
import { Field, Schema } from '@shadow-library/class-schema';

/**
 * Importing user defined packages
 */
import { Body, HttpInput, Params, Query, Req, Res, RouteInputType } from '@shadow-library/fastify';
import { HTTP_CONTROLLER_INPUTS } from '@shadow-library/fastify/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Input Decorators', () => {
  const schema = { type: 'string' } as any;

  @Schema()
  class Input {
    @Field()
    username: string;

    @Field()
    password: string;
  }

  class Controller {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static single(@HttpInput(RouteInputType.BODY, schema) _body: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static multiple(@HttpInput(RouteInputType.BODY) _body: object, _random: string, @HttpInput(RouteInputType.PARAMS, schema) _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static body(_string: string, @Body() _body: Input) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static params(@Params() _params: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static query(@Query() _params: object) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static req(@Req() _req: any) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    static res(@Res() _res: any) {}
  }

  it(`should enhance the method with the request input metadata`, () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'single');
    expect(metadata).toStrictEqual({ schemas: { body: schema } });
    expect(paramtypes).toStrictEqual(['body']);
  });

  it(`should enhance the method with the Body input metadata`, () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.body);
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'body');
    expect(paramtypes).toStrictEqual([, 'body']); // eslint-disable-line no-sparse-arrays
    expect(metadata).toStrictEqual({
      schemas: {
        body: {
          $id: expect.stringContaining(Input.name),
          type: 'object',
          required: ['username', 'password'],
          properties: {
            username: { type: 'string' },
            password: { type: 'string' },
          },
        },
      },
    });
  });

  it(`should enhance the method with the Params input metadata`, () => {
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'params');
    expect(paramtypes).toStrictEqual(['params']);
  });

  it(`should enhance the method with the Query input metadata`, () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.query);
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'query');
    expect(metadata).toStrictEqual({ schemas: { query: { $id: 'Object', type: 'object' } } });
    expect(paramtypes).toStrictEqual(['query']);
  });

  it(`should enhance the method with the request input metadata`, () => {
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'req');
    expect(paramtypes).toStrictEqual(['request']);
  });

  it(`should enhance the method with the response input metadata`, () => {
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'res');
    expect(paramtypes).toStrictEqual(['response']);
  });

  it(`should enhance the method with the multiple request input metadata`, () => {
    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.multiple);
    const paramtypes = Reflect.getMetadata(HTTP_CONTROLLER_INPUTS, Controller, 'multiple');
    expect(metadata).toStrictEqual({ schemas: { body: { $id: 'Object', type: 'object' }, params: schema } });
    expect(paramtypes).toStrictEqual(['body', , 'params']); // eslint-disable-line no-sparse-arrays
  });
});
