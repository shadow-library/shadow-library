/**
 * Importing npm packages
 */
import { TObject } from '@sinclair/typebox';
import { FastifyServerOptions } from 'fastify';

/**
 * Importing user defined packages
 */
import { ErrorHandler } from './error-handler.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export interface FastifyConfig extends FastifyServerOptions {
  host: string;
  port: number;
  responseSchema: Record<string | number, TObject>;
  errorHandler: ErrorHandler;
}
