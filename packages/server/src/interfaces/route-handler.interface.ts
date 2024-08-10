/**
 * Importing npm packages
 */
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export type RouteHandler = (req: Request, res: Response) => any | Promise<any>;

export type RawRouteHandler = (req: Http2ServerRequest, res: Http2ServerResponse) => any | Promise<any>;
