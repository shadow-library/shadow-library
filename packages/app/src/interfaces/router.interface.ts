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

export interface Router<T extends Record<string, any> = any> {
  register(route: RouteController<T>): void | Promise<void>;
}
