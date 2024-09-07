/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Request, Response } from './route-handler.interface';
import { RouteMetdata } from './server-metadata.interface';

/**
 * Defining types
 */

export type HttpMiddleware = (request: Request, response: Response) => any | Promise<any>;

export interface MiddlewareGenerator {
  generate(metadata: RouteMetdata): HttpMiddleware;
}
