/**
 * Importing npm packages
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export type Request = FastifyRequest;

export type Response = FastifyReply;

export type RouteHandler = (req: Request, res: Response) => unknown | Promise<unknown>;

export type ErrorHandler = (err: Error, req: Request, res: Response) => unknown | Promise<unknown>;
