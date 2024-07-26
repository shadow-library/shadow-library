/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { BODY_PARAMETER } from '../constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Body(): ParameterDecorator {
  return (target, propertyKey, index) => Reflect.defineMetadata(BODY_PARAMETER, index, target, propertyKey as string);
}
