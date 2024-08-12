/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { HttpMethod, MiddlewareMetadata, RouteInputSchemas } from '../decorators';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface RouteMetdata {
  method: HttpMethod;
  path: string;
  schemas?: RouteInputSchemas;
}

export type ServerMetadata = RouteMetdata | MiddlewareMetadata;