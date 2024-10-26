/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';
import { MODULE_METADATA } from '@shadow-library/app/constants';
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
    const metadata = Reflect.getMetadata(MODULE_METADATA, FastifyModule);
    metadata.providers[2]?.useFactory?.();
    const config = metadata.providers[1]?.useFactory?.();

    expect(module).toBe(FastifyModule);
    expect(metadata.imports).toStrictEqual([]);
    expect(metadata.controllers).toStrictEqual([]);
    expect(metadata.providers).toHaveLength(3);
    expect(metadata.exports).toHaveLength(1);

    expect(createFastifyInstance).toBeCalled();
    expect(config.genReqId()).toHaveLength(36);
  });

  it('should throw error if forRootAsync is called multiple times', () => {
    FastifyModule['registered'] = false;
    FastifyModule.forRoot({});
    expect(() => FastifyModule.forRoot({})).toThrow(InternalError);
  });
});
