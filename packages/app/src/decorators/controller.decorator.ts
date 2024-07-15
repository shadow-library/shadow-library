/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { CONTROLLER_WATERMARK, PATH_METADATA, ROUTE_RULES_METADATA, VERSION_METADATA } from '../constants';

/**
 * Defining types
 */

export interface ControllerOptions {
  version?: string | string[];
  [key: string]: any;
}

/**
 * Declaring the constants
 */

function toUniqueArray(value?: string | string[]) {
  if (value === undefined) return [];
  if (typeof value === 'string') return [value];
  return Array.from(new Set(value));
}

export function Controller(path?: string | string[], options?: ControllerOptions): ClassDecorator {
  const { version, ...routeRules } = options ?? {};
  const versions = toUniqueArray(version);

  return target => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(PATH_METADATA, path, target);
    Reflect.defineMetadata(VERSION_METADATA, versions, target);
    Reflect.defineMetadata(ROUTE_RULES_METADATA, routeRules, target);
  };
}
