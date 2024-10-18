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

export type HttpRequest = FastifyRequest;

export type HttpResponse = FastifyReply;

export type RouteHandler = (req: HttpRequest, res: HttpResponse) => unknown | Promise<unknown>;
