/**
 * Importing npm packages
 */
import { Route, RouteDecorator } from '@shadow-library/app';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

declare module '@shadow-library/app' {
  export interface RouteMetdata {
    auth?: boolean;
    admin?: boolean;
  }
}

/**
 * Declaring the constants
 */

export function UserGuard(enabled: boolean = true, admin?: boolean): RouteDecorator {
  return Route({ auth: enabled, admin });
}
