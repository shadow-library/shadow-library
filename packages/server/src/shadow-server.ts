/**
 * Importing npm packages
 */
import fs from 'fs';
import http from 'http';
import http2 from 'http2';

import { Router as AppRouter, RouteController } from '@shadow-library/app';
import Router, { HTTPMethod, HTTPVersion, Handler, Instance } from 'find-my-way';

/**
 * Importing user defined packages
 */
import { Request, Response, ServerConfig } from './classes';
import { MIDDLEWARE_WATERMARK } from './constants';
import { HttpMethod, MiddlewareMetadata } from './decorators';
import { HttpServer, RawRouteHandler, RouteHandler, RouteMetdata, ServerMetadata } from './interfaces';
import { ServerError, ServerErrorCode } from './server.error';

/**
 * Defining types
 */

type RouterInstance = Instance<HTTPVersion.V1> & Instance<HTTPVersion.V2>;

export interface RequestContext {
  request: Request;
  response: Response;
  params: Record<string, string>;
  query: Record<string, string>;
}

/**
 * Declaring the constants
 */
const httpMethods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL) as HTTPMethod[];

export class ShadowServer {
  private readonly router: RouterInstance;
  private readonly server: HttpServer;
  private readonly config: ServerConfig;

  private readonly routes: RouteController<RouteMetdata>[] = [];
  private readonly middlewares: RouteController<MiddlewareMetadata>[] = [];

  private inited = false;

  constructor(config: ServerConfig) {
    this.config = config;

    const routerConfig = config.getRouterConfig();
    if (!routerConfig.defaultRoute) routerConfig.defaultRoute = this.getDefaultRouteHandler();
    this.router = Router(routerConfig) as RouterInstance;

    const certificate = config.getHttpsCertificate();
    if (certificate) {
      const key = fs.readFileSync(certificate.key);
      const cert = fs.readFileSync(certificate.cert);
      this.server = http2.createSecureServer({ key, cert }, (req, res) => this.router.lookup(req, res));
    } else this.server = http.createServer((req, res) => this.router.lookup(req, res));
  }

  private getDefaultRouteHandler(): RawRouteHandler {
    const handler = this.config.getErrorHandler();
    const notFoundError = new ServerError(ServerErrorCode.S002);
    return (req, res) => handler.handle(notFoundError, new Request(req), new Response(res));
  }

  private register(route: RouteController<ServerMetadata>): void {
    const isMiddleware = (route.metadata as any)[MIDDLEWARE_WATERMARK];
    if (isMiddleware) this.middlewares.push(route as RouteController<MiddlewareMetadata>);
    else this.routes.push(route as RouteController<RouteMetdata>);
  }

  private async generateRouteHandler(route: RouteController<ServerMetadata>): Promise<Handler<HTTPVersion.V2>> {
    const argsOrder = route.paramtypes.map(p => p.name.toLowerCase()) as (keyof RequestContext)[];
    const middlewares: RouteHandler[] = [];
    for (const middleware of this.middlewares) {
      const handler = await middleware.handler(route.metadata);
      middlewares.push(handler);
    }

    return async (req, res, params, _store, query) => {
      const request = new Request(req, Buffer.alloc(0), params as Record<string, string>);
      const response = new Response(res);
      const context = { request, response, params, query };
      try {
        /** Running the middlewares */
        for (const middleware of middlewares) {
          await middleware(request, response);
          if (response.sent) return;
        }

        /** Handling the actual route and serializing the output */
        const args = argsOrder.map(arg => context[arg]);
        const resBody = await route.handler(...args);
        if (!response.sent && resBody) response.json(JSON.stringify(resBody));
      } catch (err: unknown) {
        await this.config.getErrorHandler().handle(err, request, response);
      }
    };
  }

  async init(): Promise<void> {
    for (const route of this.routes) {
      const metadata = route.metadata;
      const method = metadata.method === HttpMethod.ALL ? httpMethods : [metadata.method];
      this.router.on(method, metadata.path, await this.generateRouteHandler(route));
    }
  }

  async start(): Promise<void> {
    if (!this.inited) await this.init();
    const port = this.config.getPort();
    const hostname = this.config.getHostname();
    return await new Promise(resolve => this.server.listen(port, hostname, resolve));
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => this.server.close(err => (err ? reject(err) : resolve())));
  }

  getRouter(): AppRouter<ServerMetadata> {
    return { register: this.register.bind(this) };
  }
}
