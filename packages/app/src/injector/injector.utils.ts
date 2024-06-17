/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */

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
}

export const InjectorUtils = new InjectorUtilsStatic();
