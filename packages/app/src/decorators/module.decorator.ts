/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MODULE_METADATA, MODULE_WATERMARK } from '../constants';
import { InjectionName, Provider } from '../interfaces';
import { ForwardReference } from '../utils';

/**
 * Defining types
 */
export interface ModuleMetadata {
  /**
   * List of imported modules that export the providers which are required in this module.
   */
  imports?: (Class<unknown> | ForwardReference<Class<unknown>>)[];

  /**
   * List of controllers defined in this module which have to be instantiated.
   */
  controllers?: Class<unknown>[];

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
    for (const metadataKey of validMetadataKeys) {
      const value = metadata[metadataKey as keyof ModuleMetadata] ?? [];
      Reflect.defineMetadata(metadataKey, value, target);
    }
  };
}
