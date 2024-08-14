/**
 * Importing npm packages
 */
import { Server } from 'http';
import { Http2SecureServer } from 'http2';

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

export type HttpServer = Server | Http2SecureServer;
