/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { Request, Response } from './route-handler.interface';

/**
 * Defining types
 */

export type HttpMiddleware = (request: Request, response: Response) => any | Promise<any>;

export interface MiddlewareGenerator {
  generate(metadata: RouteMetdata): HttpMiddleware;
}
