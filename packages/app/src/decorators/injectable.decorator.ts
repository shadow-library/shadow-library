/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { INJECTABLE_WATERMARK, TRANSIENT_METADATA } from '../constants';

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

export function Injectable(options?: InjectableOptions): ClassDecorator {
  const transient = options?.transient;

  return target => {
    Reflect.defineMetadata(INJECTABLE_WATERMARK, true, target);
    Reflect.defineMetadata(TRANSIENT_METADATA, transient, target);
  };
}
