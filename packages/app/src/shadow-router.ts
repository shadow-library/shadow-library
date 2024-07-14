/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Controller } from './injector';
import { Router } from './interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowRouter implements Router {
  private readonly controllers: Controller[] = [];

  registerController(controller: Controller): void {
    this.controllers.push(controller);
  }
}
