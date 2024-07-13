/**
 * Importing npm packages
 */
import { IncomingMessage } from 'http';

import { parse } from 'cookie';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Request {
  readonly url: string;
  readonly method: string;
  readonly pathname: string;
  readonly hash: string;

  readonly query: URLSearchParams;
  readonly cookies: Record<string, string | string[]> = {};

  constructor(
    readonly raw: IncomingMessage,
    readonly body: Buffer = Buffer.alloc(0),
    readonly params: Record<string, string> = {},
  ) {
    const url = new URL(raw.url as string);

    this.url = raw.url as string;
    this.method = raw.method as string;
    this.pathname = url.pathname;
    this.hash = url.hash;

    this.query = url.searchParams;
    this.cookies = raw.headers.cookie ? parse(raw.headers.cookie) : {};
  }

  hasHeader(name: string): boolean {
    return this.raw.headers[name.toLowerCase()] !== undefined;
  }

  getHeader(name: string): string | string[] | undefined {
    return this.raw.headers[name.toLowerCase()];
  }
}
