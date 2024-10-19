/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ObjectUtils {
  /**
   * Returns the value of the given path in the object
   */
  getByPath<T = any>(obj: Record<string, any>, path: string): T | undefined {
    let value = obj;
    for (const key of path.split('.')) {
      if (value === undefined || value === null) return undefined;
      value = value[key];
    }

    return value as T;
  }
}

export const objectUtils = new ObjectUtils();
