/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Header, HttpStatus, Redirect, Render } from '@shadow-library/fastify';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('HTTP Output Decorators', () => {
  it(`should enhance the method with the status metadata`, () => {
    class Controller {
      @HttpStatus(200)
      static single() {}
    }

    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ status: 200 });
  });

  it(`should enhance the method with the headers metadata`, () => {
    class Controller {
      @Header({ 'Content-Type': 'application/json' })
      static single() {}
    }

    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ headers: { 'Content-Type': 'application/json' } });
  });

  it(`should enhance the method with the redirect metadata`, () => {
    class Controller {
      @Redirect('/redirect')
      static single() {}
    }

    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ redirect: '/redirect', status: 301 });
  });

  it(`should enhance the method with the render metadata`, () => {
    class Controller {
      @Render('view')
      static single() {}
    }

    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ render: 'view' });
  });

  it(`should enhance the method with the render metadata with default data`, () => {
    class Controller {
      @Render()
      static single() {}
    }

    const metadata = Utils.getRouteMetadata(Controller.single);
    expect(metadata).toStrictEqual({ render: true });
  });
});
