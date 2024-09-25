/**
 * Importing npm packages
 */
import { Route } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { HTTP_ROUTE } from '../constants';

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
  ALL = 'ALL',
}

export interface RouteOptions {
  method: HttpMethod;
  path?: string;
}

/**
 * Declaring the constants
 */

export function HttpRoute(options: RouteOptions): MethodDecorator {
  if (!options.path) options.path = '/';
  if (!options.path.startsWith('/')) options.path = '/' + options.path;
  return Route({ ...options, [HTTP_ROUTE]: true });
}

export const Get = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.GET, path });

export const Post = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.POST, path });

export const Put = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.PUT, path });

export const Delete = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.DELETE, path });

export const Patch = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.PATCH, path });

export const Options = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.OPTIONS, path });

export const Head = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.HEAD, path });

export const All = (path?: string): MethodDecorator => HttpRoute({ method: HttpMethod.ALL, path });
