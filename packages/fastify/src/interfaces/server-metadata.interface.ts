/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';
import { RouteShorthandOptions } from 'fastify';

/**
 * Importing user defined packages
 */
import { HTTP_CONTROLLER_TYPE } from '../constants';
import { HttpMethod, RouteInputSchemas } from '../decorators';

/**
 * Defining types
 */

declare module '@shadow-library/app' {
  export interface RouteMetdata extends Omit<RouteShorthandOptions, 'config'> {
    method?: HttpMethod;
    path?: string;
    schemas?: RouteInputSchemas;

    rawBody?: boolean;

    status?: number;
    headers?: Record<string, string | (() => string)>;
    redirect?: string;
    render?: string | true;
  }

  export interface ControllerMetdata {
    [HTTP_CONTROLLER_TYPE]?: 'router' | 'middleware';
    path?: string;
  }
}

export type ServerMetadata = RouteMetdata;
