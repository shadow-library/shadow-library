/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { CONTROLLER_METADATA, CONTROLLER_WATERMARK } from '../constants';

/**
 * Defining types
 */

export interface ControllerMetdata extends Record<string | symbol, any> {
  router?: boolean;
}

/**
 * Declaring the constants
 */

export function Controller(metadata: ControllerMetdata = {}): ClassDecorator {
  return target => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(CONTROLLER_METADATA, metadata, target);
  };
}
