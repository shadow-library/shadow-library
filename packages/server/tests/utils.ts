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

class UtilsStatic {
  getSymbolMetadata(key: string, target: object): any {
    const keys = Reflect.getMetadataKeys(target) as (string | symbol)[];
    const symbol = keys.find(k => typeof k === 'symbol' && k.description === key);
    return Reflect.getMetadata(symbol, target);
  }

  getRouteMetadata(target: object): Record<string, any> {
    return this.getSymbolMetadata('route:metadata', target);
  }
}

export const Utils = new UtilsStatic();
