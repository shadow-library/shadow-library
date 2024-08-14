/**
 * Importing npm packages
 */
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse } from 'http2';

/**
 * Importing user defined packages
 */
import { Request, Response } from '../classes';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export type RawRequest = IncomingMessage | Http2ServerRequest;

export type RawResponse = ServerResponse | Http2ServerResponse;

export type RouteHandler = (req: Request, res: Response) => unknown | Promise<unknown>;

export type RawRouteHandler = (req: RawRequest, res: RawResponse) => unknown | Promise<unknown>;
