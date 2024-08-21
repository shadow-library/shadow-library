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
}

/**
 * Declaring the constants
 */
const PROPERTY_KEY = 'generate';

export function Middleware(): ClassDecorator {
  return target => {
    const descriptor = Reflect.getOwnPropertyDescriptor(target.prototype, PROPERTY_KEY);
    assert(descriptor, `Cannot apply @Middleware to a class without a 'generate()' method`);

    Controller({ [MIDDLEWARE_WATERMARK]: true, target })(target);
    Route()(target.prototype, PROPERTY_KEY, descriptor);
  };
}
