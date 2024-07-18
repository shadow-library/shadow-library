/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';
import { Type } from '@shadow-library/types';
import { merge } from 'lodash';

/**
 * Importing user defined packages
 */
import { CONTROLLER_WATERMARK, ROUTE_RULES_METADATA, ROUTE_WATERMARK } from '../constants';

/**
 * Defining types
 */
type Func = (...args: any[]) => any | Promise<any>;

export interface RouteController<T extends Record<string, any>> {
  rules: T;
  handler: Func;
}

/**
 * Declaring the constants
 */
const isRoute = (method: object) => Reflect.hasMetadata(ROUTE_WATERMARK, method);
const getRouteRules = (method: object) => Reflect.getMetadata(ROUTE_RULES_METADATA, method);

export class ControllerWrapper {
  private readonly instance: Record<string, any>;
  private readonly type: Type;

  constructor(Controller: Type, dependencies: object[]) {
    const isController = Reflect.hasMetadata(CONTROLLER_WATERMARK, Controller);
    if (!isController) throw new InternalError(`Class '${Controller.name}' is not a controller`);
    this.type = Controller;
    this.instance = new Controller(...dependencies);
  }

  getRoutes<T extends object>(): RouteController<T>[] {
    /* Extracting the route methods present in the instance */
    const methods = new Set<Func>();
    let prototype = this.instance;
    do {
      for (const propertyName of Object.getOwnPropertyNames(prototype)) {
        const method = this.instance[propertyName];
        const isRouteMethod = typeof method === 'function' && isRoute(method);
        if (isRouteMethod) methods.add(method);
      }
    } while ((prototype = Object.getPrototypeOf(prototype)));

    /* Extracting the route rules from the route methods */
    const routes: RouteController<T>[] = [];
    const baseRouteRules = getRouteRules(this.type);
    for (const method of methods) {
      const methodRouteRules = getRouteRules(method);
      const rules = merge({}, baseRouteRules, methodRouteRules);
      routes.push({ rules, handler: method.bind(this.instance) });
    }

    return routes;
  }
}