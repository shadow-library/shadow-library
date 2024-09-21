/**
 * Importing npm packages
 */
import { TObject, Type } from '@sinclair/typebox';
import { FastifyHttpOptions } from 'fastify';
import { v4 as uuid } from 'uuid';

/**
 * Importing user defined packages
 */
import { Context } from './context';
import { DefaultErrorHandler } from './default-error-handler';
import { ErrorHandler } from '../interfaces';

/**
 * Defining types
 */

type ServerOptions = FastifyHttpOptions<any, any>;

/**
 * Declaring the constants
 */
const errorResponseSchema = Type.Object({
  code: Type.String(),
  type: Type.String(),
  message: Type.String(),
  fields: Type.Optional(Type.Array(Type.Object({ field: Type.String(), msg: Type.String() }))),
});

export class ServerConfig {
  private port = 8080;
  private hostname = '127.0.0.1';

  private options: ServerOptions = ServerConfig.getDefaultOptions();
  private errorHandler = new DefaultErrorHandler();
  private responseSchemas = {} as Record<number | string, TObject>;

  private context?: Context;

  private static getDefaultOptions(): ServerOptions {
    const config: ServerOptions = {};
    config.ignoreTrailingSlash = true;
    config.ajv = { customOptions: { removeAdditional: true, useDefaults: true, allErrors: true } };
    config.genReqId = () => uuid();
    return config;
  }

  getPort(): number {
    return this.port;
  }

  setPort(port: number): this {
    this.port = port;
    return this;
  }

  getHostname(): string | undefined {
    return this.hostname;
  }

  setHostname(hostname: string): this {
    this.hostname = hostname;
    return this;
  }

  getServerOptions(): ServerOptions {
    return this.options;
  }

  setServerOption<T extends keyof ServerOptions>(key: T, value: Required<ServerOptions>[T]): this {
    this.options[key] = value;
    return this;
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  setErrorHandler(errorHandler: ErrorHandler): this {
    this.errorHandler = errorHandler;
    return this;
  }

  addGlobalResponseSchema(statusCode: number | string, schema: TObject): this {
    this.responseSchemas[statusCode] = schema;
    return this;
  }

  addDefaultErrorSchema(statusCode: number | string): this {
    return this.addGlobalResponseSchema(statusCode, errorResponseSchema);
  }

  getGlobalResponseSchema(): Record<number | string, TObject>;
  getGlobalResponseSchema(statusCode: number | string): TObject | undefined;
  getGlobalResponseSchema(statusCode?: number | string): Record<number | string, TObject> | TObject | undefined {
    return statusCode ? this.responseSchemas[statusCode] : this.responseSchemas;
  }

  getContext(): Context | undefined {
    return this.context;
  }

  setContext(context: Context): this {
    this.context = context;
    return this;
  }
}
