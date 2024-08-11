/**
 * Importing npm packages
 */
import http from 'http2';

import { Router as AppRouter, RouteController } from '@shadow-library/app';
import Router, { HTTPMethod, HTTPVersion, Handler, Instance } from 'find-my-way';

/**
 * Importing user defined packages
 */
import { Request, Response, ServerConfig } from './classes';
import { HttpMethod } from './decorators';
import { RawRouteHandler, ServerMetadata } from './interfaces';
import { ServerError, ServerErrorCode } from './server.error';

/**
 * Defining types
 */

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
  private readonly router: Instance<HTTPVersion.V2>;
  private readonly server: http.Http2Server;
  private readonly config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;

    const routerConfig = config.getRouterConfig();
    if (!routerConfig.defaultRoute) routerConfig.defaultRoute = this.getDefaultRouteHandler();
    this.router = Router(routerConfig);

    this.server = http.createServer((req, res) => this.router.lookup(req, res));
  }

  private getDefaultRouteHandler(): RawRouteHandler {
    const handler = this.config.getErrorHandler();
    const notFoundError = new ServerError(ServerErrorCode.S002);
    return (req, res) => handler.handle(notFoundError, new Request(req), new Response(res));
  }

  private register(route: RouteController<ServerMetadata>): void {
    const metadata = route.metadata;
    const method = metadata.method === HttpMethod.ALL ? httpMethods : [metadata.method];
    this.router.on(method, metadata.path, this.generateRouteHandler(route));
  }

  private generateRouteHandler(route: RouteController<ServerMetadata>): Handler<HTTPVersion.V2> {
    const argsOrder = route.paramtypes.map(p => p.name.toLowerCase()) as (keyof RequestContext)[];
    return async (req, res, params, _store, query) => {
      const request = new Request(req, Buffer.alloc(0), params as Record<string, string>);
      const response = new Response(res);
      const context = { request, response, params, query };
      try {
        const args = argsOrder.map(arg => context[arg]);
        await route.handler(...args);
      } catch (err: unknown) {
        await this.config.getErrorHandler().handle(err, request, response);
      }
    };
  }

  start(): Promise<void> {
    const port = this.config.getPort();
    const hostname = this.config.getHostname();
    return new Promise(resolve => this.server.listen(port, hostname, resolve));
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => this.server.close(err => (err ? reject(err) : resolve())));
  }

  getRouter(): AppRouter<ServerMetadata> {
    return { register: this.register.bind(this) };
  }
}
