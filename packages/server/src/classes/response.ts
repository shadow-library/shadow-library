/**
 * Importing npm packages
 */
import { ServerResponse } from 'http';

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
  constructor(readonly raw: ServerResponse) {}

  setHeader(name: string, value: string): this {
    this.raw.setHeader(name, value);
    return this;
  }

  setCookie(name: string, value: string, options: CookieOpts = {}): this {
    const cookieOpts = { ...options } as CookieSerializeOptions;
    if (options.maxAge !== undefined && options.expires === undefined) {
      cookieOpts.expires = new Date(Date.now() + options.maxAge * 1000);
      delete cookieOpts.maxAge;
    }

    const cookie = serialize(name, value, options);
    this.raw.setHeader('Set-Cookie', cookie);
    return this;
  }

  clearCookie(name: string, options: Pick<CookieOpts, 'domain' | 'path'> = {}): this {
    return this.setCookie(name, '', { path: '/', ...options, expires: new Date(0) });
  }

  setStatusCode(code: number): this {
    this.raw.statusCode = code;
    return this;
  }

  send(contentType: string, body: string): this {
    this.setHeader('Content-Type', contentType);
    this.setHeader('Content-Length', Buffer.byteLength(body).toString());
    this.raw.end(body);
    return this;
  }
}
