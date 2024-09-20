/**
 * Importing npm packages
 */
import assert from 'assert';

import { Controller, Route } from '@shadow-library/app';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MIDDLEWARE_WATERMARK } from '../constants';

/**
 * Defining types
 */

export interface MiddlewareMetadata {
  [MIDDLEWARE_WATERMARK]: true;
  target: Class<unknown>;
  options: MiddlewareOptions;
  generates: boolean;
}

export interface MiddlewareOptions {
  /** Denotes whether to execute before or after the handler */
  type: 'before' | 'after';

  /** Denotes the execution order, the higher value gets executed first */
  weight: number;
}

/**
 * Declaring the constants
 */
const propertyKeys = ['generate', 'use'] as const;

export function Middleware(options: Partial<MiddlewareOptions> = {}): ClassDecorator {
  if (!options.type) options.type = 'before';
  if (!options.weight) options.weight = 0;

  return target => {
    const key = propertyKeys.find(key => key in target.prototype);
    assert(key, `Cannot apply @Middleware to a class without a 'generate()' or 'use()' method`);

    const descriptor = Reflect.getOwnPropertyDescriptor(target.prototype, key);
    assert(descriptor, 'Unable to find the descriptor for the method');

    Controller({ [MIDDLEWARE_WATERMARK]: true, target, options, generates: key === 'generate' })(target);
    Route()(target.prototype, key, descriptor);
  };
}
