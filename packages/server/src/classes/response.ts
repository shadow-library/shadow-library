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

  setHeader(name: string, value: string | number): this {
    this.raw.setHeader(name, value);
    return this;
  }

  setCookie(name: string, value: string, options: CookieOpts = {}): this {
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
    return this.setCookie(name, '', { ...options, expires: new Date(0) });
  }

  setStatusCode(code: number): this {
    this.raw.statusCode = code;
    return this;
  }

  isSent(): boolean {
    return this.raw.writableEnded;
  }

  send(contentType: string, body: string): this {
    const buffer = Buffer.from(body);
    this.setHeader('Content-Type', contentType);
    this.setHeader('Content-Length', buffer.length);
    this.raw.end(buffer);
    return this;
  }
}
