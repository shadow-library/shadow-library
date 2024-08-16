/**
 * Importing npm packages
 */
import { IncomingMessage, ServerResponse } from 'http';
import { Http2ServerRequest, Http2ServerResponse, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';

import { jest } from '@jest/globals';
import { PARAMTYPES_METADATA } from '@shadow-library/app';
import { HTTPMethod } from 'find-my-way';

/**
 * Importing user defined packages
 */
import { RawRequest, RawResponse, ShadowServer } from '@shadow-library/server';

/**
 * Defining types
 */

type HttpVersion = 'v1' | 'v2';

export interface RouteResult {
  handler(params?: Record<string, string>, query?: Record<string, string>): Promise<unknown>;
}

/**
 * Declaring the constants
 */
const defaultHeader = {
  host: 'testing.shadow-apps.com',
  'user-agent': 'Jest',
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
  'accept-language': 'en-GB,en;q=0.5',
  'accept-encoding': 'gzip, deflate, br, zstd',
  connection: 'keep-alive',
};

class UtilsStatic {
  getSymbolMetadata(key: string, target: object): any {
    const keys = Reflect.getMetadataKeys(target) as (string | symbol)[];
    const symbol = keys.find(k => typeof k === 'symbol' && k.description === key);
    return Reflect.getMetadata(symbol, target);
  }

  getRouteMetadata(target: object): Record<string, any> {
    return this.getSymbolMetadata('route:metadata', target);
  }

  getParamMetadata(target: object, method: string): Record<string, any> {
    return Reflect.getMetadata(PARAMTYPES_METADATA, target, method);
  }

  private getMockedStream(): ServerHttp2Stream {
    const stream = {} as any;
    const methods = ['on', 'respond', 'write', 'end'];
    for (const method of methods) stream[method] = jest.fn();
    return stream;
  }

  getMockedRequest(method: HTTPMethod, url: string, headers: Record<string, string> = {}, version: HttpVersion = 'v1'): RawRequest {
    const httpHeaders = { ...defaultHeader, ...headers } as IncomingHttpHeaders;
    if (method === 'POST' || method === 'PUT') httpHeaders['content-type'] = 'application/json';

    if (version === 'v1') {
      const http = new IncomingMessage(null as any);
      http.url = url;
      http.method = method;
      http.headers = httpHeaders;
      return http;
    }

    httpHeaders[':method'] = method;
    httpHeaders[':path'] = url;
    const stream = this.getMockedStream();
    return new Http2ServerRequest(stream, httpHeaders, null as any, null as any);
  }

  getMockedResponse(version: HttpVersion = 'v1'): RawResponse {
    if (version === 'v1') {
      const request = new IncomingMessage(null as any);
      return new ServerResponse(request);
    }

    const stream = this.getMockedStream();
    return new Http2ServerResponse(stream);
  }

  getRoute(server: ShadowServer, method: HTTPMethod, path: string): RouteResult | null {
    const req = Utils.getMockedRequest(method, path);
    const res = Utils.getMockedResponse();
    /** @ts-expect-error accessing private property */
    const route = server.router.findRoute(method, path);
    if (!route) return null;
    return { handler: (params = {}, query = {}) => route.handler(req as any, res as any, params, {}, query) };
  }
}

export const Utils = new UtilsStatic();
