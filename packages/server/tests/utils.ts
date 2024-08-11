/**
 * Importing npm packages
 */
import { Http2ServerRequest, Http2ServerResponse, IncomingHttpHeaders, ServerHttp2Stream } from 'http2';

import { jest } from '@jest/globals';
import { PARAMTYPES_METADATA } from '@shadow-library/app';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

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

  getMockedStream(): ServerHttp2Stream {
    const stream = {} as any;
    const methods = ['on', 'respond', 'write', 'end'];
    for (const method of methods) stream[method] = jest.fn();
    return stream;
  }

  getMockedRequest(method: string, url: string, headers?: Record<string, string>) {
    const httpHeaders = { ...defaultHeader, ...headers } as IncomingHttpHeaders;
    httpHeaders[':method'] = method;
    httpHeaders[':path'] = url;
    if (method === 'POST' || method === 'PUT') httpHeaders['content-type'] = 'application/json';
    const stream = this.getMockedStream();
    return new Http2ServerRequest(stream, httpHeaders, null as any, null as any);
  }

  getMockedResponse(): Http2ServerResponse {
    const stream = this.getMockedStream();
    return new Http2ServerResponse(stream);
  }
}

export const Utils = new UtilsStatic();
