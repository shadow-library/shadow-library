/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MODULE_METADATA } from '../constants';
import { InjectionToken, Provider } from '../interfaces';
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
  exports?: InjectionToken[];
}

/**
 * Declaring the constants
 */

export function Module(metadata: ModuleMetadata): ClassDecorator {
  return target => Reflect.defineMetadata(MODULE_METADATA, metadata, target);
}
