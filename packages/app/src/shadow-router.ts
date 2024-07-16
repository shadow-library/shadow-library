/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { ControllerWrapper } from './injector';
import { Router } from './interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowRouter implements Router {
  private readonly controllers: ControllerWrapper[] = [];

  registerController(controller: ControllerWrapper): void {
    this.controllers.push(controller);
  }
}
