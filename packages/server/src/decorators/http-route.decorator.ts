/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { ROUTE_METADATA } from '../constants';

/**
 * Defining types
 */

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
  HEAD = 'HEAD',
  SEARCH = 'SEARCH',
  ALL = 'ALL',
}

export interface RouteOptions {
  method: HttpMethod;
  path?: string;
}

/**
 * Declaring the constants
 */

export function Route(options: RouteOptions): MethodDecorator {
  if (!options.path) options.path = '/';
  return (_target, _key, descriptor) => {
    Reflect.defineMetadata(ROUTE_METADATA, options, descriptor.value as object);
    return descriptor;
  };
}

export const Get = (path?: string): MethodDecorator => Route({ method: HttpMethod.GET, path });

export const Post = (path?: string): MethodDecorator => Route({ method: HttpMethod.POST, path });

export const Put = (path?: string): MethodDecorator => Route({ method: HttpMethod.PUT, path });

export const Delete = (path?: string): MethodDecorator => Route({ method: HttpMethod.DELETE, path });

export const Patch = (path?: string): MethodDecorator => Route({ method: HttpMethod.PATCH, path });

export const Options = (path?: string): MethodDecorator => Route({ method: HttpMethod.OPTIONS, path });

export const Head = (path?: string): MethodDecorator => Route({ method: HttpMethod.HEAD, path });

export const Search = (path?: string): MethodDecorator => Route({ method: HttpMethod.SEARCH, path });

export const All = (path?: string): MethodDecorator => Route({ method: HttpMethod.ALL, path });
