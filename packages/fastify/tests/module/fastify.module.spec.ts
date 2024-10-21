/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { FastifyModule } from '@shadow-library/fastify';
import { createFastifyInstance } from '@shadow-library/fastify/module/fastify.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

jest.mock('@shadow-library/fastify/module/fastify.utils', () => ({
  createFastifyInstance: jest.fn(),
}));

describe('FastifyModule', () => {
  it('should setup the module for static config', () => {
    const module = FastifyModule.forRoot({});
    const metadata = {
      imports: Reflect.getMetadata('imports', FastifyModule),
      providers: Reflect.getMetadata('providers', FastifyModule),
      controllers: Reflect.getMetadata('controllers', FastifyModule),
      exports: Reflect.getMetadata('exports', FastifyModule),
    };

    expect(module).toBe(FastifyModule);
    expect(metadata.imports).toStrictEqual([]);
    expect(metadata.controllers).toStrictEqual([]);
    expect(metadata.providers).toHaveLength(3);
    expect(metadata.exports).toHaveLength(2);

    metadata.providers[2]?.useFactory?.();
    const config = metadata.providers[1]?.useFactory?.();
    expect(createFastifyInstance).toBeCalled();
    expect(config).toStrictEqual({
      host: '127.0.0.1',
      port: 3000,
      responseSchema: { '4xx': expect.any(Object), '5xx': expect.any(Object) },

      ignoreTrailingSlash: true,
      requestIdLogLabel: 'rid',
      errorHandler: expect.any(Object),
      genReqId: expect.any(Function),
      ajv: { customOptions: { removeAdditional: true, useDefaults: true, allErrors: true } },
    });
    expect(config.genReqId()).toHaveLength(36);
  });

  it('should throw error if forRootAsync is called multiple times', () => {
    FastifyModule['registered'] = false;
    FastifyModule.forRoot({});
    expect(() => FastifyModule.forRoot({})).toThrow(InternalError);
  });
});
