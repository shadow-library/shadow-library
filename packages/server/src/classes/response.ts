/**
 * Importing npm packages
 */
import { Http2ServerResponse } from 'http2';

import { type CookieSerializeOptions, serialize } from 'cookie';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface CookieOpts {
  domain?: string;
  path?: string;
  expires?: Date;
  maxAge?: number;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: boolean | 'lax' | 'strict' | 'none';
}

/**
 * Declaring the constants
 */

export class Response {
  constructor(readonly raw: Http2ServerResponse) {}

  header(name: string, value: string | number): this {
    this.raw.setHeader(name, value);
    return this;
  }

  cookie(name: string, value: string, options: CookieOpts = {}): this {
    const cookieOpts = { ...options } as CookieSerializeOptions;
    if (cookieOpts.path === undefined) cookieOpts.path = '/';
    if (options.maxAge !== undefined && options.expires === undefined) {
      cookieOpts.expires = new Date(Date.now() + options.maxAge * 1000);
      delete cookieOpts.maxAge;
    }

    const cookie = serialize(name, value, cookieOpts);
    this.raw.setHeader('Set-Cookie', cookie);
    return this;
  }

  clearCookie(name: string, options: Pick<CookieOpts, 'domain' | 'path'> = {}): this {
    return this.cookie(name, '', { ...options, expires: new Date(0) });
  }

  status(code: number): this {
    this.raw.statusCode = code;
    return this;
  }

  get sent(): boolean {
    return this.raw.writableEnded;
  }

  send(contentType: string, body: string): this {
    const buffer = Buffer.from(body);
    this.header('Content-Type', contentType);
    this.header('Content-Length', buffer.length);
    this.raw.end(buffer);
    return this;
  }

  json(body: string): this {
    return this.send('application/json', body);
  }
}
