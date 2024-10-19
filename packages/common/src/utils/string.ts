/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { objectUtils } from './object';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class StringUtils {
  /**
   * Interpolates the given string with the given object
   */
  interpolate(str: string, obj: Record<string, any>): string {
    return str.replace(/\\?\{([^{}]+)\}/g, (match, key) => {
      if (match.startsWith('\\')) return match.slice(1);
      const value = objectUtils.getByPath(obj, key.trim());
      return value?.toString() ?? match;
    });
  }
}

export const stringUtils = new StringUtils();
