/**
 * Importing npm packages
 */
import http from 'http2';

import { Router as AppRouter, RouteController } from '@shadow-library/app';
import Router, { HTTPMethod, HTTPVersion, Instance } from 'find-my-way';

/**
 * Importing user defined packages
 */
import { Request, Response, ServerConfig } from './classes';
import { HttpMethod, RouteInputSchemas } from './decorators';
import { RawRouteHandler } from './interfaces';
import { ServerError, ServerErrorCode } from './server.error';

/**
 * Defining types
 */

export interface ShadowServerMetadata {
  method: HttpMethod;
  path: string;
  schemas?: RouteInputSchemas;
}

/**
 * Declaring the constants
 */
const allHttpMethods = Object.values(HttpMethod).filter(m => m !== HttpMethod.ALL);

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

  private register(route: RouteController<ShadowServerMetadata>): void {
    const metadata = route.metadata;
    const method = (metadata.method === HttpMethod.ALL ? allHttpMethods : [metadata.method]) as HTTPMethod[];
    this.router.on(method, metadata.path, async (req, res, params, _store, query) => {
      const request = new Request(req, Buffer.alloc(0), params as Record<string, string>);
      const response = new Response(res);
      try {
        await route.handler({ request, response, params, query });
      } catch (err: unknown) {
        await this.config.getErrorHandler().handle(err, request, response);
      }
    });
  }

  start(): Promise<void> {
    const port = this.config.getPort();
    const hostname = this.config.getHostname();
    return new Promise(resolve => this.server.listen(port, hostname, resolve));
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => this.server.close(err => (err ? reject(err) : resolve())));
  }

  getRouter(): AppRouter<ShadowServerMetadata> {
    return { register: this.register.bind(this) };
  }
}
