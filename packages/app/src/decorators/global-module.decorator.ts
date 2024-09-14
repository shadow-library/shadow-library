/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Module, ModuleMetadata } from './module.decorator';
import { GLOBAL_WATERMARK, MODULE_METADATA } from '../constants';

/**
 * Defining types
 */

export type GlobalModuleMetadata = Pick<ModuleMetadata, 'providers' | 'exports'>;

/**
 * Declaring the constants
 */
const invalidMetadataKeys = [MODULE_METADATA.CONTROLLERS, MODULE_METADATA.IMPORTS] as string[];

export function GlobalModule(metadata: GlobalModuleMetadata): ClassDecorator {
  const properties = Object.keys(metadata);
  for (const property of properties) {
    const invalid = invalidMetadataKeys.includes(property);
    if (invalid) throw new InternalError(`Invalid property '${property}' passed into the @GlobalModule() decorator.`);
  }

  return target => {
    Reflect.defineMetadata(GLOBAL_WATERMARK, true, target);
    Module(metadata)(target);
  };
}
