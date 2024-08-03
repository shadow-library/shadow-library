/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { CONTROLLER_WATERMARK, ROUTE_METADATA } from '../constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function Controller(metadata?: object): ClassDecorator {
  return target => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(ROUTE_METADATA, metadata, target);
  };
}
