/**
 * Importing npm packages
 */
import { Module, ModuleMetadata, Router } from '@shadow-library/app';
import { InternalError, utils } from '@shadow-library/common';
import { Type } from '@sinclair/typebox';
import { v4 as uuid } from 'uuid';

/**
 * Importing user defined packages
 */
import { DefaultErrorHandler } from '../classes';
import { FASTIFY_CONFIG, FASTIFY_INSTANCE } from '../constants';
import { FastifyConfig, FastifyModuleAsyncOptions, FastifyModuleOptions } from './fastify-module.interface';
import { FastifyRouter } from './fastify-router';
import { createFastifyInstance } from './fastify.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const metadata: Required<ModuleMetadata> = {
  imports: [],
  controllers: [],
  providers: [{ token: Router, useClass: FastifyRouter }],
  exports: [Router, FASTIFY_CONFIG],
};

@Module(metadata)
export class FastifyModule {
  private static registered = false;

  private static getDefaultConfig(): FastifyConfig {
    const fields = Type.Optional(Type.Array(Type.Object({ field: Type.String(), msg: Type.String() })));
    const errorResponseSchema = Type.Object({ code: Type.String(), type: Type.String(), message: Type.String(), fields });

    return {
      host: '127.0.0.1',
      port: 3000,
      responseSchema: { '4xx': errorResponseSchema, '5xx': errorResponseSchema },
      errorHandler: new DefaultErrorHandler(),

      ignoreTrailingSlash: true,
      requestIdLogLabel: 'rid',
      genReqId: () => uuid(),
      ajv: { customOptions: { removeAdditional: true, useDefaults: true, allErrors: true } },
    };
  }

  static forRoot(options: FastifyModuleOptions): FastifyModule {
    const config = Object.assign({}, this.getDefaultConfig(), utils.object.omitKeys(options, ['imports', 'fastifyFactory']));
    return this.forRootAsync({ imports: options.imports, useFactory: () => config, fastifyFactory: options.fastifyFactory });
  }

  static forRootAsync(options: FastifyModuleAsyncOptions): FastifyModule {
    if (this.registered) throw new InternalError('FastifyModule is already registered');
    this.registered = true;

    metadata.imports = options.imports ?? [];
    metadata.providers.push({ token: FASTIFY_CONFIG, useFactory: options.useFactory, inject: options.inject });
    const fastifyFactory = (config: FastifyConfig) => createFastifyInstance(config, options.fastifyFactory);
    metadata.providers.push({ token: FASTIFY_INSTANCE, useFactory: fastifyFactory, inject: [FASTIFY_CONFIG] });

    return FastifyModule;
  }
}
