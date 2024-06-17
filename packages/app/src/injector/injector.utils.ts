/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { InjectionName } from '../interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class InjectorUtilsStatic {
  getMetadata<T>(key: string, target: Type): T[] {
    return Reflect.getMetadata(key, target) ?? [];
  }

  getProviderName(provider: InjectionName): string {
    if (typeof provider === 'function') return provider.name;
    return provider.toString();
  }
}

export const InjectorUtils = new InjectorUtilsStatic();
