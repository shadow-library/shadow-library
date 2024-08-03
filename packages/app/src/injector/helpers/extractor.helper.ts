/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { ROUTE_METADATA } from '@shadow-library/app/constants';
import { InjectionName } from '@shadow-library/app/interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ExtractorStatic {
  getMetadata<T>(key: string, target: Type): T[] {
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
