/**
 * Importing npm packages
 */
import { parse } from 'cookie';

/**
 * Importing user defined packages
 */
import { RawRequest } from '../interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class Request {
  readonly url: string;
  readonly method: string;

  readonly body?: any;
  readonly cookies: Record<string, string | string[]> = {};

  constructor(
    readonly raw: RawRequest,
    readonly rawBody: Buffer = Buffer.alloc(0),
    readonly params: Record<string, string> = {},
    readonly query: Record<string, string> = {},
  ) {
    this.url = raw.url as string;
    this.method = raw.method as string;

    this.cookies = raw.headers.cookie ? parse(raw.headers.cookie) : {};
  }

  get path(): string {
    return this.url.split('?')[0] as string;
  }

  /**
   * @internal
   */
  parseBody(): void {
    const isJSON = this.raw.headers['content-type']?.toLowerCase() === 'application/json';
    const rawBody = this.rawBody;
    if (rawBody.length > 0 && isJSON) {
      /** @ts-expect-error set readonly body */
      this.body = JSON.parse(rawBody.toString());
    }
  }

  hasHeader(name: string): boolean {
    return this.raw.headers[name.toLowerCase()] !== undefined;
  }

  getHeader(name: string): string | string[] | undefined {
    return this.raw.headers[name.toLowerCase()];
  }
}
