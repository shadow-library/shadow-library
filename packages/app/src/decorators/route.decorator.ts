/**
 * Importing npm packages
 */
import { merge } from 'lodash';

/**
 * Importing user defined packages
 */
import { ROUTE_RULES_METADATA, ROUTE_WATERMARK } from '../constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Route(rules?: Record<string, any>): MethodDecorator {
  return (_target, _propertyKey, descriptor) => {
    Reflect.defineMetadata(ROUTE_WATERMARK, true, descriptor.value as object);

    const metadata = Reflect.getMetadata(ROUTE_RULES_METADATA, descriptor.value as object) ?? {};
    const routeRules = merge(metadata, rules);
    Reflect.defineMetadata(ROUTE_RULES_METADATA, routeRules, descriptor.value as object);

    return descriptor;
  };
}
