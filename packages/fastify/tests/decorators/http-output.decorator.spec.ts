/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { ROUTE_METADATA } from '@shadow-library/app/constants';
import { Field, Schema } from '@shadow-library/class-schema';

/**
 * Importing user defined packages
 */
import { Header, HttpStatus, Redirect, Render, RespondFor } from '@shadow-library/fastify';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Output Decorators', () => {
  @Schema()
  class Input {
    @Field()
    name: string;
  }

  it(`should enhance the method with the status metadata`, () => {
    class Controller {
      @HttpStatus(200)
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({ status: 200 });
  });

  it(`should enhance the method with the headers metadata`, () => {
    const getContentLength = () => '20';
    class Controller {
      @Header('Content-Type', 'application/json')
      @Header('Content-Length', getContentLength)
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({ headers: { 'Content-Type': 'application/json', 'Content-Length': getContentLength } });
  });

  it(`should enhance the method with the redirect metadata`, () => {
    class Controller {
      @Redirect('/redirect')
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({ redirect: '/redirect', status: 301 });
  });

  it(`should enhance the method with the render metadata`, () => {
    class Controller {
      @Render('view')
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({ render: 'view' });
  });

  it(`should enhance the method with the render metadata with default data`, () => {
    class Controller {
      @Render()
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({ render: true });
  });

  it('should enhace the method with response schema metadata', () => {
    class Controller {
      @RespondFor(200, Input)
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({
      schemas: {
        response: {
          200: {
            $id: expect.stringContaining(Input.name),
            type: 'object',
            required: ['name'],
            properties: { name: { type: 'string' } },
          },
        },
      },
    });
  });

  it('should enhace the method with multiple response schema metadata', () => {
    class Controller {
      @RespondFor(200, Input)
      @RespondFor(201, { type: 'object' })
      static single() {}
    }

    const metadata = Reflect.getMetadata(ROUTE_METADATA, Controller.single);
    expect(metadata).toStrictEqual({
      schemas: {
        response: {
          200: {
            $id: expect.stringContaining(Input.name),
            type: 'object',
            required: ['name'],
            properties: { name: { type: 'string' } },
          },
          201: { type: 'object' },
        },
      },
    });
  });
});
