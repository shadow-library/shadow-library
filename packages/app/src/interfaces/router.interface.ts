/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { RouteController } from '../injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface Router {
  registerRoute<T extends Record<string, any> = any>(route: RouteController<T>): void | Promise<void>;
}
