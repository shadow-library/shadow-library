/**
 * Importing npm packages
 */
import { TObject } from '@sinclair/typebox';
import { FastifyHttpOptions } from 'fastify';

/**
 * Importing user defined packages
 */
import { ErrorHandler } from '../interfaces';

/**
 * Defining types
 */

type ServerOptions = FastifyHttpOptions<any, any>;

/**
 * Declaring the constants
 */

export class ServerConfig {
  private port = 8080;
  private hostname = '127.0.0.1';

  private options: ServerOptions = ServerConfig.getDefaultOptions();
  private errorHandler = ServerConfig.getDefaultErrorHandler();
  private responseSchemas: Record<number | string, TObject> = {};

  private static getDefaultOptions(): ServerOptions {
    const config: ServerOptions = {};
    config.ignoreTrailingSlash = true;
    return config;
  }

  private static getDefaultErrorHandler(): ErrorHandler {
    return (err, _req, res) => res.status(err.message === 'Not Found' ? 404 : 500).send(`{"message":"${(err as any)?.message ?? 'Unknown Error'}"}`);
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

  getServerConfig(): ServerOptions {
    return this.options;
  }

  setServerConfig<T extends keyof ServerOptions>(key: T, value: Required<ServerOptions>[T]): this {
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

  getGlobalResponseSchema(): Record<number | string, TObject>;
  getGlobalResponseSchema(statusCode: number | string): TObject | undefined;
  getGlobalResponseSchema(statusCode?: number | string): Record<number | string, TObject> | TObject | undefined {
    return statusCode ? this.responseSchemas[statusCode] : this.responseSchemas;
  }
}
