/**
 * Importing npm packages
 */
import assert from 'assert';

import { Controller } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { HTTP_CONTROLLER_TYPE } from '../constants';

/**
 * Defining types
 */

export type MiddlewareType = 'onRequest' | 'preParsing' | 'preValidation' | 'preHandler' | 'preSerialization' | 'onSend' | 'onResponse' | 'onError';

export interface MiddlewareOptions {
  /**
   * Denotes when to execute the middleware. default value is `preHandler`.
   * see https://fastify.dev/docs/latest/Reference/Lifecycle for more information
   */
  type: MiddlewareType;

  /** Denotes the execution order, the higher value gets executed first */
  weight: number;
}

export interface MiddlewareMetadata extends MiddlewareOptions {
  [HTTP_CONTROLLER_TYPE]: 'middleware';
  generates: boolean;
}

/**
 * Declaring the constants
 */
const propertyKeys = ['generate', 'use'];

export function Middleware(options: Partial<MiddlewareOptions> = {}): ClassDecorator {
  if (!options.type) options.type = 'preHandler';
  if (!options.weight) options.weight = 0;

  return target => {
    const key = propertyKeys.find(key => key in target.prototype);
    assert(key, `Cannot apply @Middleware to a class without a 'generate()' or 'use()' method`);
    Controller({ ...options, [HTTP_CONTROLLER_TYPE]: 'middleware', generates: key === 'generate' })(target);
  };
}
