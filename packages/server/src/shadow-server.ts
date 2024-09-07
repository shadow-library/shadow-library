/**
 * Importing npm packages
 */
import { Router as AppRouter, RouteController } from '@shadow-library/app';
import { FastifyInstance, HTTPMethods, fastify } from 'fastify';
import { Chain as MockRequestChain, InjectOptions as MockRequestOptions, Response as MockResponse } from 'light-my-request';
import { JsonObject } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ServerConfig } from './classes';
import { MIDDLEWARE_WATERMARK } from './constants';
import { HttpMethod, MiddlewareMetadata } from './decorators';
import { type Request, type Response, RouteHandler, RouteMetdata, ServerMetadata } from './interfaces';
import { ServerError, ServerErrorCode } from './server.error';

/**
 * Defining types
 */

export interface RequestContext {
  request: Request;
  response: Response;
  params: Record<string, string>;
  query: Record<string, string>;
  body: JsonObject;
}

/**
 * Declaring the constants
 */
const httpMethods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL) as HTTPMethods[];

export class ShadowServer {
  private readonly server: FastifyInstance;
  private readonly config: ServerConfig;

  private readonly routes: RouteController<RouteMetdata>[] = [];
  private readonly middlewares: RouteController<MiddlewareMetadata>[] = [];

  private inited = false;

  constructor(config: ServerConfig) {
    this.config = config;

    const configs = config.getServerConfig();
    const notFoundHandler = this.getDefaultRouteHandler();
    const errorHandler = config.getErrorHandler();

    this.server = fastify(configs);
    this.server.setNotFoundHandler(notFoundHandler);
    this.server.setErrorHandler(errorHandler);
  }

  private getDefaultRouteHandler(): RouteHandler {
    const handler = this.config.getErrorHandler();
    const notFoundError = new ServerError(ServerErrorCode.S002);
    return (req, res) => handler(notFoundError, req, res);
  }

  private register(route: RouteController<ServerMetadata>): void {
    const isMiddleware = (route.metadata as any)[MIDDLEWARE_WATERMARK];
    if (isMiddleware) this.middlewares.push(route as RouteController<MiddlewareMetadata>);
    else this.routes.push(route as RouteController<RouteMetdata>);
  }

  private async generateRouteHandler(route: RouteController<ServerMetadata>): Promise<RouteHandler> {
    const argsOrder = route.paramtypes.map(p => (typeof p === 'string' ? p : null)) as (keyof RequestContext | null)[];
    const middlewares: RouteHandler[] = [];
    for (const middleware of this.middlewares) {
      const handler = await middleware.handler(route.metadata);
      if (typeof handler === 'function') middlewares.push(handler as RouteHandler);
    }

    return async (request, response) => {
      const params = request.params as Record<string, string>;
      const query = request.query as Record<string, string>;
      const body = request.body as JsonObject;
      const context = { request, response, params, query, body };
      try {
        /** Running the middlewares */
        for (const middleware of middlewares) {
          await middleware(request, response);
          if (response.sent) return;
        }

        /** Handling the actual route and serializing the output */
        const args = argsOrder.map(arg => arg && context[arg]);
        const resBody = await route.handler(...args);
        if (!response.sent && resBody) response.send(resBody);
      } catch (err: unknown) {
        const handler = this.config.getErrorHandler();
        await handler(err as Error, request, response);
      }
    };
  }

  async init(): Promise<void> {
    this.inited = true;
    for (const route of this.routes) {
      const metadata = route.metadata;
      const method = metadata.method === HttpMethod.ALL ? httpMethods : [metadata.method];
      const handler = await this.generateRouteHandler(route);
      this.server.route({ method, url: metadata.path, handler });
    }
  }

  async start(): Promise<void> {
    if (!this.inited) await this.init();
    const port = this.config.getPort();
    const host = this.config.getHostname();
    await this.server.listen({ port, host });
  }

  stop(): Promise<void> {
    return this.server.close();
  }

  getRouter(): AppRouter<ServerMetadata> {
    return { register: this.register.bind(this) };
  }

  mockRequest(): MockRequestChain;
  mockRequest(options: MockRequestOptions): MockRequestChain;
  mockRequest(options?: MockRequestOptions): MockRequestChain | Promise<MockResponse> {
    return options ? this.server.inject(options) : this.server.inject();
  }
}
