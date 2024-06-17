/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';
import { type Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { MODULE_METADATA, MODULE_WATERMARK } from '../constants';
import { InjectionName, Provider } from '../interfaces';

/**
 * Defining types
 */
export interface ModuleMetadata {
  /**
   * List of imported modules that export the providers which are required in this module.
   */
  imports?: Type[];

  /**
   * List of controllers defined in this module which have to be instantiated.
   */
  controllers?: Type[];

  /**
   * List of providers that will be instantiated by the Shadow injector and that may be shared
   * at least across this module.
   */
  providers?: Provider[];

  /**
   * List of the subset of providers that are provided by this module and should be available
   * in other modules which import this module.
   */
  exports?: InjectionName[];
}

/**
 * Declaring the constants
 */
const validMetadataKeys = Object.values(MODULE_METADATA) as string[];

export function Module(metadata: ModuleMetadata): ClassDecorator {
  const properties = Object.keys(metadata);
  for (const property of properties) {
    const validKey = validMetadataKeys.includes(property);
    if (!validKey) throw new InternalError(`Invalid property '${property}' passed into the @Module() decorator.`);
  }

  return target => {
    Reflect.defineMetadata(MODULE_WATERMARK, true, target);
    for (const property in metadata) Reflect.defineMetadata(property, metadata[property as keyof ModuleMetadata], target);
  };
}
