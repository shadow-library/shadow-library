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
  register<T extends Record<string, any> = any>(route: RouteController<T>): void | Promise<void>;
}
