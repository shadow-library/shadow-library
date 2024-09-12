/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { HttpRequest, HttpResponse } from './route-handler.interface';

/**
 * Defining types
 */

export type HttpMiddleware = (request: HttpRequest, response: HttpResponse) => any | Promise<any>;

export interface MiddlewareGenerator {
  generate(metadata: RouteMetdata): HttpMiddleware;
}
