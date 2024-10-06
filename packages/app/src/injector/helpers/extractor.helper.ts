/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { CONTROLLER_METADATA, ROUTE_METADATA } from '../../constants';
import { InjectionToken } from '../../interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ExtractorStatic {
  getMetadata<T>(key: string, target: Class<unknown>): T[] {
    return Reflect.getMetadata(key, target) ?? [];
  }

  getProviderName(provider: InjectionToken): string {
    if (typeof provider === 'function') return provider.name;
    return provider.toString();
  }

  getRouteMetadata(method: object): Record<string, any> {
    return Reflect.getMetadata(ROUTE_METADATA, method);
  }

  getControllerMetadata(target: object): Record<string, any> {
    return Reflect.getMetadata(CONTROLLER_METADATA, target);
  }
}

export const Extractor = new ExtractorStatic();
