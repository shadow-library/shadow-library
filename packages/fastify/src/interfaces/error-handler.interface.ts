/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { HttpRequest, HttpResponse } from './route-handler.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface ErrorHandler {
  handle(err: Error, req: HttpRequest, res: HttpResponse): any | Promise<any>;
}
