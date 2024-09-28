/**
 * Importing npm packages
 */
import assert from 'assert';

import { Router as AppRouter, RouteController, RouteMetdata } from '@shadow-library/app';
import { InternalError, ValidationError } from '@shadow-library/common';
import { FastifyInstance, HTTPMethods, RouteOptions, fastify } from 'fastify';
import { FastifySchemaValidationError, SchemaErrorDataVar } from 'fastify/types/schema';
import { Chain as MockRequestChain, InjectOptions as MockRequestOptions, Response as MockResponse } from 'light-my-request';
import { JsonObject } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ServerConfig } from './classes';
import { HTTP_ROUTE, MIDDLEWARE_WATERMARK } from './constants';
import { HttpMethod, MiddlewareMetadata, MiddlewareType } from './decorators';
import { type HttpRequest, type HttpResponse, MiddlewareHandler, RouteHandler, ServerMetadata } from './interfaces';
import { ServerError, ServerErrorCode } from './server.error';

/**
 * Defining types
 */
declare module 'fastify' {
  interface FastifyRequest {
    rawBody?: Buffer;
  }

  interface FastifyContextConfig {
    metadata: ServerMetadata;
  }
}

export interface RequestContext {
  request: HttpRequest;
  response: HttpResponse;
  params: Record<string, string>;
  query: Record<string, string>;
  body: JsonObject;
}

/**
 * Declaring the constants
 */
const httpMethods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL) as HTTPMethods[];

export class ShadowServer {
  private readonly instance: FastifyInstance;
  private readonly config: ServerConfig;

  private readonly routes: RouteController<RouteMetdata>[] = [];
  private readonly middlewares: RouteController<MiddlewareMetadata>[] = [];

  private inited = false;

  constructor(config: ServerConfig) {
    this.config = config;

    const options = config.getServerOptions();
    this.instance = fastify(options);

    const notFoundHandler = this.getDefaultRouteHandler();
    this.instance.setNotFoundHandler(notFoundHandler);

    const errorHandler = config.getErrorHandler();
    this.instance.setErrorHandler(errorHandler.handle.bind(errorHandler));

    const schemaErrorFormatter = this.formatSchemaErrors.bind(this);
    this.instance.setSchemaErrorFormatter(schemaErrorFormatter);
  }

  private getDefaultRouteHandler(): RouteHandler {
    const handler = this.config.getErrorHandler();
    const notFoundError = new ServerError(ServerErrorCode.S002);
    return (req, res) => handler.handle(notFoundError, req, res);
  }

  private register(route: RouteController<ServerMetadata>): void {
    if (this.inited) throw new InternalError('Cannot register routes after the server has been initialized');
    const isMiddleware = (route.metadata as any)[MIDDLEWARE_WATERMARK];
    if (isMiddleware) this.middlewares.push(route as RouteController<MiddlewareMetadata>);
    else this.routes.push(route as RouteController<RouteMetdata>);
  }

  private registerRawBody(): void {
    const opts = { parseAs: 'buffer' as const };
    const parser = this.instance.getDefaultJsonParser('error', 'error');
    this.instance.addContentTypeParser<Buffer>('application/json', opts, (req, body, done) => {
      const { metadata } = req.routeOptions.config;
      if (metadata.rawBody) req.rawBody = body;
      return parser(req, body.toString(), done);
    });
  }

  private formatSchemaErrors(errors: FastifySchemaValidationError[], dataVar: SchemaErrorDataVar): ValidationError {
    const validationError = new ValidationError();
    for (const error of errors) {
      let key = dataVar;
      if (error.instancePath) key += error.instancePath.replaceAll('/', '.');
      validationError.addFieldError(key, error.message ?? 'Field validation failed');
    }
    return validationError;
  }

  private async generateRouteHandler(route: RouteController<ServerMetadata>): Promise<RouteHandler> {
    const metadata = route.metadata;
    const statusCode = metadata.status ?? metadata.method === HttpMethod.POST ? 201 : 200;
    const argsOrder = route.paramtypes.map(p => (typeof p === 'string' ? p : null)) as (keyof RequestContext | null)[];

    return async (request, response) => {
      const params = request.params as Record<string, string>;
      const query = request.query as Record<string, string>;
      const body = request.body as JsonObject;
      const context = { request, response, params, query, body };

      /** Setting the status code and headers */
      response.status(statusCode);
      for (const [key, value] of Object.entries(metadata.headers ?? {})) {
        response.header(key, typeof value === 'function' ? value() : value);
      }

      /** Handling the actual route and serializing the output */
      const args = argsOrder.map(arg => arg && context[arg]);
      const data = await route.handler(...args);

      if (metadata.redirect) return response.status(metadata.status ?? 301).redirect(metadata.redirect);

      if (metadata.render) {
        let template = metadata.render;
        let templateData = data;
        if (template === true) {
          template = data.template;
          templateData = data.data;
        }

        return (response as any).viewAsync(template, templateData);
      }

      if (!response.sent && data) return response.send(data);
    };
  }

  getInstance(): FastifyInstance {
    return this.instance;
  }

  async init(): Promise<void> {
    if (this.inited) return;
    this.inited = true;

    const hasRawBody = this.routes.some(r => r.metadata.rawBody);
    if (hasRawBody) this.registerRawBody();

    const context = this.config.getContext();
    if (context) this.instance.addHook('onRequest', context.init());
    this.middlewares.sort((a, b) => b.metadata.options.weight - a.metadata.options.weight);

    for (const route of this.routes) {
      const metadata = route.metadata;
      assert(metadata.path, 'Route path is required');
      assert(metadata.method, 'Route method is required');

      const routeOptions = { config: { metadata } } as RouteOptions;
      routeOptions.url = metadata.basePath ? metadata.basePath + metadata.path : metadata.path;
      routeOptions.method = metadata.method === HttpMethod.ALL ? httpMethods : [metadata.method];
      routeOptions.handler = await this.generateRouteHandler(route);

      /** Applying middlewares */
      const middlewares: Partial<Record<MiddlewareType, MiddlewareHandler[]>> = {};
      for (const middleware of this.middlewares) {
        const { generates, options } = middleware.metadata;
        const handler = generates ? await middleware.handler(metadata) : middleware.handler.bind(middleware);
        if (typeof handler === 'function') {
          if (!middlewares[options.type]) middlewares[options.type] = [];
          const handlers = middlewares[options.type];
          assert(handlers, 'Impossible state');
          handlers.push(handler);
        }
      }
      for (const [type, handlers] of Object.entries(middlewares)) routeOptions[type as MiddlewareType] = handlers;

      routeOptions.schema = {};
      routeOptions.attachValidation = metadata.silentValidation ?? false;
      const response = this.config.getGlobalResponseSchema();
      routeOptions.schema.response = { ...response };
      if (metadata.schemas?.body) routeOptions.schema.body = metadata.schemas.body;
      if (metadata.schemas?.params) routeOptions.schema.params = metadata.schemas.params;
      if (metadata.schemas?.query) routeOptions.schema.querystring = metadata.schemas.query;

      this.instance.route(routeOptions);
    }
  }

  async start(): Promise<void> {
    if (!this.inited) await this.init();
    const port = this.config.getPort();
    const host = this.config.getHostname();
    await this.instance.listen({ port, host });
  }

  stop(): Promise<void> {
    return this.instance.close();
  }

  getRouter(): AppRouter<ServerMetadata> {
    return { register: this.register.bind(this), identifier: HTTP_ROUTE };
  }

  mockRequest(): MockRequestChain;
  mockRequest(options: MockRequestOptions): MockRequestChain;
  mockRequest(options?: MockRequestOptions): MockRequestChain | Promise<MockResponse> {
    return options ? this.instance.inject(options) : this.instance.inject();
  }
}
