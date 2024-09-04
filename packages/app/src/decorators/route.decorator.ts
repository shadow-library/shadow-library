/**
 * Importing npm packages
 */
import merge from 'lodash/merge.js';

/**
 * Importing user defined packages
 */
import { ROUTE_METADATA, ROUTE_WATERMARK } from '../constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Route(metadata?: Record<string, any>): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    Reflect.defineMetadata(ROUTE_WATERMARK, true, descriptor.value as object);

    const oldMetadata = Reflect.getMetadata(ROUTE_METADATA, descriptor.value as object) ?? {};
    const newMetadata = merge(oldMetadata, metadata);
    Reflect.defineMetadata(ROUTE_METADATA, newMetadata, descriptor.value as object);

    return descriptor;
  };
}
