/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { METHOD_METADATA, PATH_METADATA } from '@shadow-library/server/constants';

/**
 * Defining types
 */

export enum HttpMethod {
  GET,
  POST,
  PUT,
  DELETE,
  PATCH,
  OPTIONS,
  HEAD,
  SEARCH,
}

export type HttpMethodDecorator = (path?: string) => MethodDecorator;

/**
 * Declaring the constants
 */

function createHttpMethodDecorator(method: HttpMethod): HttpMethodDecorator {
  return (path = '/'): MethodDecorator => {
    return (_target, _key, descriptor) => {
      Reflect.defineMetadata(PATH_METADATA, path, descriptor.value as object);
      Reflect.defineMetadata(METHOD_METADATA, method, descriptor.value as object);
      return descriptor;
    };
  };
}

export const Get = createHttpMethodDecorator(HttpMethod.GET);

export const Post = createHttpMethodDecorator(HttpMethod.POST);

export const Put = createHttpMethodDecorator(HttpMethod.PUT);

export const Delete = createHttpMethodDecorator(HttpMethod.DELETE);

export const Patch = createHttpMethodDecorator(HttpMethod.PATCH);

export const Options = createHttpMethodDecorator(HttpMethod.OPTIONS);

export const Head = createHttpMethodDecorator(HttpMethod.HEAD);

export const Search = createHttpMethodDecorator(HttpMethod.SEARCH);
