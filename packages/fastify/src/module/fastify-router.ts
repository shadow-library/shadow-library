/**
 * Importing npm packages
 */
import assert from 'assert';

import { ControllerRouteMetadata, Inject, Injectable, RouteController, Router } from '@shadow-library/app';
import { InternalError, Logger, utils } from '@shadow-library/common';
import merge from 'deepmerge';
import { type FastifyInstance, RouteOptions } from 'fastify';
import { Chain as MockRequestChain, InjectOptions as MockRequestOptions, Response as MockResponse } from 'light-my-request';
import { Class, JsonObject } from 'type-fest';

/**
 * Importing user defined packages
 */
import { FASTIFY_CONFIG, FASTIFY_INSTANCE, HTTP_CONTROLLER_TYPE } from '../constants';
import { HttpMethod, MiddlewareMetadata } from '../decorators';
import { HttpRequest, HttpResponse, RouteHandler, ServerMetadata } from '../interfaces';
import { type FastifyConfig } from './fastify-module.interface';

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

interface ParsedController<T> {
  metatype: Class<unknown>;
  instance: object;
  paramtypes: (string | Class<unknown>)[];
  returnType?: Class<unknown>;

  metadata: T;
  handler: (...args: any[]) => any | Promise<any>;
}

interface ParsedControllers {
  middlewares: ParsedController<MiddlewareMetadata>[];
  routes: ParsedController<ServerMetadata>[];
}

/**
 * Declaring the constants
 */
const httpMethods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL) as Exclude<HttpMethod, HttpMethod.ALL>[];

@Injectable()
export class FastifyRouter extends Router {
  private readonly logger = Logger.getLogger(FastifyRouter.name);

  constructor(
    @Inject(FASTIFY_CONFIG) private readonly config: FastifyConfig,
    @Inject(FASTIFY_INSTANCE) private readonly instance: FastifyInstance,
  ) {
    super();
  }

  getInstance(): FastifyInstance {
    return this.instance;
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

  private parseControllers(controllers: ControllerRouteMetadata[]): ParsedControllers {
    const parsedControllers: ParsedControllers = { middlewares: [], routes: [] };
    for (const controller of controllers) {
      switch (controller.metadata[HTTP_CONTROLLER_TYPE]) {
        case 'router': {
          const { instance, metadata, metatype } = controller;
          const basePath = metadata.path ?? '';
          for (const route of controller.routes) {
            const routePath = route.metadata.path ?? '';
            const path = basePath + routePath;
            const parsedController: ParsedController<ServerMetadata> = { ...route, instance, metatype };
            parsedController.metadata.path = path || '/';
            parsedControllers.routes.push(parsedController);
          }
          break;
        }

        case 'middleware': {
          const metadata = controller.metadata as MiddlewareMetadata;
          const { instance, metatype } = controller;
          const method = metadata.generates ? 'generate' : 'use';
          const handler = (controller.instance as any)[method].bind(instance);
          parsedControllers.middlewares.push({ metadata, handler, paramtypes: [], instance, metatype });
          break;
        }

        default: {
          throw new InternalError(`Unknown controller type: ${controller.metadata[HTTP_CONTROLLER_TYPE]}`);
        }
      }
    }

    parsedControllers.middlewares.sort((a, b) => b.metadata.weight - a.metadata.weight);

    return parsedControllers;
  }

  private generateRouteHandler(route: RouteController): RouteHandler {
    const metadata = route.metadata;
    const statusCode = metadata.status ?? (metadata.method === HttpMethod.POST ? 201 : 200);
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

  async register(controllers: ControllerRouteMetadata[]): Promise<void> {
    const { middlewares, routes } = this.parseControllers(controllers);
    const defaultResponseSchemas = this.config.responseSchema ?? {};

    const hasRawBody = routes.some(r => r.metadata.rawBody);
    if (hasRawBody) this.registerRawBody();

    for (const route of routes) {
      const metadata = route.metadata;
      assert(metadata.path, 'Route path is required');
      assert(metadata.method, 'Route method is required');
      this.logger.debug(`registering route ${metadata.method} ${metadata.path}`);

      const fastifyRouteOptions = utils.object.omitKeys(metadata, ['path', 'method', 'schemas', 'rawBody', 'status', 'headers', 'redirect', 'render']);
      const routeOptions = { ...fastifyRouteOptions, config: { metadata } } as RouteOptions;
      routeOptions.url = metadata.path;
      routeOptions.method = metadata.method === HttpMethod.ALL ? httpMethods : [metadata.method];
      routeOptions.handler = this.generateRouteHandler(route);

      /** Applying middlewares */
      for (const middleware of middlewares) {
        const name = middleware.metatype.name;
        const { generates, type } = middleware.metadata;
        const handler = generates ? await middleware.handler(metadata) : middleware.handler.bind(middleware);
        if (typeof handler === 'function') {
          this.logger.debug(`applying '${type}' middleware '${name}'`);
          const middlewareHandler = routeOptions[type] as RouteHandler[];
          if (middlewareHandler) middlewareHandler.push(handler);
          else routeOptions[type] = [handler];
        }
      }

      routeOptions.schema = {};
      routeOptions.attachValidation = metadata.silentValidation ?? false;
      routeOptions.schema.response = merge(metadata.schema?.response ?? {}, defaultResponseSchemas);
      if (metadata.schemas?.body) routeOptions.schema.body = metadata.schemas.body;
      if (metadata.schemas?.params) routeOptions.schema.params = metadata.schemas.params;
      if (metadata.schemas?.query) routeOptions.schema.querystring = metadata.schemas.query;
      this.logger.debug('route options', { options: routeOptions });

      this.instance.route(routeOptions);
      this.logger.info(`registered route ${metadata.method} ${routeOptions.url}`);
    }
  }

  async start(): Promise<void> {
    const options = utils.object.pickKeys(this.config, ['port', 'host']);
    const address = await this.instance.listen(options);
    this.logger.info(`server started at ${address}`);
  }

  async stop(): Promise<void> {
    this.logger.info('stopping server');
    await this.instance.close();
  }

  mockRequest(): MockRequestChain;
  mockRequest(options: MockRequestOptions): MockRequestChain;
  mockRequest(options?: MockRequestOptions): MockRequestChain | Promise<MockResponse> {
    return options ? this.instance.inject(options) : this.instance.inject();
  }
}
