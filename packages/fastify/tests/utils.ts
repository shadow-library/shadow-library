/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { PARAMTYPES_METADATA } from '@shadow-library/fastify/constants';

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

  getControllerMetadata(target: object): Record<string, any> {
    return this.getSymbolMetadata('controller:metadata', target);
  }

  getParamMetadata(target: object, method: string): Record<string, any> {
    return Reflect.getMetadata(PARAMTYPES_METADATA, target, method);
  }
}

export const Utils = new UtilsStatic();
