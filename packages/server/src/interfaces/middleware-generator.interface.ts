/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { RouteMetdata } from './server-metadata.interface';
import { Request, Response } from '../classes';

/**
 * Defining types
 */

export type HttpMiddleware = (request: Request, response: Response) => any | Promise<any>;

export interface MiddlewareGenerator {
  generate(metadata: RouteMetdata): HttpMiddleware;
}
