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
    silentValidation?: boolean;

    rawBody?: boolean;
    bodyLimit?: number;

    status?: number;
    headers?: Record<string, string | (() => string)>;
    redirect?: string;
    render?: string;
  }
}

export type ServerMetadata = RouteMetdata;
