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
  abstract register(controller: ControllerRouteMetadata): any | Promise<any>;

  abstract start(): any | Promise<any>;

  abstract stop(): any | Promise<any>;
}
