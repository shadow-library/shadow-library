/**
 * Importing npm packages
 */
import { RequiredFields } from '@shadow-library/types';
import { Config, HTTPVersion } from 'find-my-way';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type TRouterConfig = Config<HTTPVersion.V2>;

type RouterConfig = RequiredFields<TRouterConfig, 'defaultRoute' | 'ignoreTrailingSlash' | 'maxParamLength'>;

/**
 * Declaring the constants
 */

export class ServerConfig {
  private port: number = 8080;
  private hostname?: string;

  private routerConfig = ServerConfig.getDefaultRouterConfig();

  private static getDefaultRouterConfig(): RouterConfig {
    const config: TRouterConfig = {};

    config.ignoreTrailingSlash = true;
    config.caseSensitive = true;
    config.maxParamLength = 100;

    const notFoundBuffer = Buffer.from(JSON.stringify({ message: 'Not Found' }));
    const notFoundHeader = { 'Content-Type': 'application/json', 'Content-Length': notFoundBuffer.length };
    config.defaultRoute = (_req, res) => res.writeHead(404, notFoundHeader).end(notFoundBuffer);

    return config as RouterConfig;
  }

  getPort(): number {
    return this.port;
  }

  setPort(port: number): this {
    this.port = port;
    return this;
  }

  getHostname(): string | undefined {
    return this.hostname;
  }

  setHostname(hostname: string): this {
    this.hostname = hostname;
    return this;
  }

  getRouterConfig(): RouterConfig {
    return this.routerConfig;
  }

  setRouterConfig<T extends keyof RouterConfig>(key: T, value: Required<RouterConfig>[T]): this {
    this.routerConfig[key] = value;
    return this;
  }
}
