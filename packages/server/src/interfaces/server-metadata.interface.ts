/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';
import { RouteShorthandOptions } from 'fastify';

/**
 * Importing user defined packages
 */
import { HttpMethod, RouteInputSchemas } from '../decorators';

/**
 * Defining types
 */

declare module '@shadow-library/app' {
  export interface RouteMetdata extends Omit<RouteShorthandOptions, 'config'> {
    basePath?: string;
    method?: HttpMethod;
    path?: string;
    schemas?: RouteInputSchemas;

    rawBody?: boolean;

    status?: number;
    headers?: Record<string, string | (() => string)>;
    redirect?: string;
    render?: string | true;
  }
}

export type ServerMetadata = RouteMetdata;
