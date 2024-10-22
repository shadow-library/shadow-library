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

  /**
   * Returns a new object with the needed fields.
   */
  pickKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
    const newObj: any = {};
    for (let index = 0; index < keys.length; index++) {
      const key = keys[index]!;
      newObj[key] = obj[key];
    }
    return newObj;
  }

  /**
   * Return a new object after removing the unneeded keys from the orginal object.
   */
  omitKeys<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
    const newObj: any = {};
    const allKeys = Object.keys(obj) as K[];
    for (let index = 0; index < allKeys.length; index++) {
      const key = allKeys[index]!;
      if (!keys.includes(key)) newObj[key] = obj[key];
    }
    return newObj;
  }
}

export const objectUtils = new ObjectUtils();
