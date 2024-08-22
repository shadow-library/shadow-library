/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ROUTE_METADATA } from '../../constants';
import { InjectionName } from '../../interfaces';

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

  getProviderName(provider: InjectionName): string {
    if (typeof provider === 'function') return provider.name;
    return provider.toString();
  }

  getRouteMetadata(method: object): Record<string, any> {
    return Reflect.getMetadata(ROUTE_METADATA, method);
  }
}

export const Extractor = new ExtractorStatic();
