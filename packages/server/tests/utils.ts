/**
 * Importing npm packages
 */
import { IncomingMessage } from 'http';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class UtilsStatic {
  getSymbolMetadata(key: string, target: object): any {
    const keys = Reflect.getMetadataKeys(target) as (string | symbol)[];
    const symbol = keys.find(k => typeof k === 'symbol' && k.description === key);
    return Reflect.getMetadata(symbol, target);
  }

  getRouteMetadata(target: object): Record<string, any> {
    return this.getSymbolMetadata('route:metadata', target);
  }

  getMockedIncomingMessage(method: string, url: string, headers?: Record<string, string>) {
    const message = new IncomingMessage(null as any);
    message.url = url;
    message.method = method;
    message.headers = {
      host: 'testing.shadow-apps.com',
      'user-agent': 'Jest',
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8',
      'accept-language': 'en-GB,en;q=0.5',
      'accept-encoding': 'gzip, deflate, br, zstd',
      connection: 'keep-alive',
      ...headers,
    };
    if (method === 'POST' || method === 'PUT') message.headers['content-type'] = 'application/json';

    return message;
  }
}

export const Utils = new UtilsStatic();
