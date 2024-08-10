/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { HttpMethod, RouteInputArgs, RouteInputSchemas } from '../decorators';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface ServerMetadata {
  method: HttpMethod;
  path: string;
  schemas?: RouteInputSchemas;
  args?: RouteInputArgs;
}
