/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { ControllerWrapper } from '../injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface Router {
  registerController(controller: ControllerWrapper): void;
}
