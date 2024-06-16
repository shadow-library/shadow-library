/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { OPTIONAL_DEPS_METADATA } from '../constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Optional(): ParameterDecorator {
  return (target, _key, index) => {
    let args = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, target) ?? [];
    args = [...args, index];
    Reflect.defineMetadata(OPTIONAL_DEPS_METADATA, args, target);
  };
}
