/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { HttpMethod, RouteInputSchemas } from '../decorators';

/**
 * Defining types
 */

declare module '@shadow-library/app' {
  export interface RouteMetdata {
    basePath?: string;
    method?: HttpMethod;
    path?: string;
    schemas?: RouteInputSchemas;

    bodyLimit?: number;
  }
}

export type ServerMetadata = RouteMetdata;
