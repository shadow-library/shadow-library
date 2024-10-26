/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { INJECTABLE_METADATA } from '../constants';

/**
 * Defining types
 */

export interface InjectableOptions {
  /**
   * Whether to initate a new private instance of the provider for every use
   */
  transient?: boolean;
}

/**
 * Declaring the constants
 */

export function Injectable(options: InjectableOptions = {}): ClassDecorator {
  return target => Reflect.defineMetadata(INJECTABLE_METADATA, options, target);
}
