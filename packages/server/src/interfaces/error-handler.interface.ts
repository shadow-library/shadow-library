/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Request, Response } from '../classes';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface ErrorHandler {
  handle(error: unknown, req: Request, res: Response): any | Promise<any>;
}
