/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { CONTROLLER_WATERMARK, PATH_METADATA, VERSION_METADATA } from '../constants';

/**
 * Defining types
 */

export interface ControllerOptions {
  path: string | string[];

  version?: string | string[];
}

/**
 * Declaring the constants
 */

function toUniqueArray(value?: string | string[]) {
  if (value === undefined) return [];
  if (typeof value === 'string') return [value];
  return Array.from(new Set(value));
}

export function Controller(path: string | string[]): ClassDecorator;
export function Controller(options: ControllerOptions): ClassDecorator;
export function Controller(pathOrOptions: string | string[] | ControllerOptions): ClassDecorator {
  const options = typeof pathOrOptions === 'string' || Array.isArray(pathOrOptions) ? { path: pathOrOptions } : pathOrOptions;
  const path = toUniqueArray(options.path);
  const version = toUniqueArray(options.version);

  return target => {
    Reflect.defineMetadata(CONTROLLER_WATERMARK, true, target);
    Reflect.defineMetadata(PATH_METADATA, path, target);
    Reflect.defineMetadata(VERSION_METADATA, version, target);
  };
}
