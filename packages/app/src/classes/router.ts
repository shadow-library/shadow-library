/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ControllerMetdata, Injectable, RouteMetdata } from '../decorators';

/**
 * Defining types
 */

export interface RouteController {
  metadata: RouteMetdata;
  handler: (...args: any[]) => any | Promise<any>;
  paramtypes: (string | Class<unknown>)[];
  returnType?: Class<unknown>;
}

export interface ControllerRouteMetadata {
  metatype: Class<unknown>;
  metadata: ControllerMetdata;
  routes: RouteController[];
}

/**
 * Declaring the constants
 */

@Injectable()
export abstract class Router {
  /**
   * Method that will be called to register the controllers.
   * In terms of server, this method should register the controllers to the router.
   */
  abstract register(controller: ControllerRouteMetadata[]): any | Promise<any>;

  /**
   * Method that will be called to start the router.
   * In terms of server, this method should listen to requests in a particular port.
   */
  abstract start(): any | Promise<any>;

  /**
   * Method that will be called to stop the router.
   * In terms of server, this method should stop listening to requests and close the server.
   */
  abstract stop(): any | Promise<any>;
}
