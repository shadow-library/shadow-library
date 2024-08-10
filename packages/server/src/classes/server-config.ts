/**
 * Importing npm packages
 */
import { Config, HTTPVersion } from 'find-my-way';

/**
 * Importing user defined packages
 */
import { ErrorHandler } from '../interfaces';

/**
 * Defining types
 */

type RouterConfig = Config<HTTPVersion.V2>;

/**
 * Declaring the constants
 */

export class ServerConfig {
  private port = 8080;
  private hostname = '127.0.0.1';

  private routerConfig = ServerConfig.getDefaultRouterConfig();
  private errorHandler = ServerConfig.getDefaultErrorHandler();

  private static getDefaultRouterConfig(): RouterConfig {
    const config: RouterConfig = {};
    config.ignoreTrailingSlash = true;
    config.maxParamLength = 100;
    return config as RouterConfig;
  }

  private static getDefaultErrorHandler(): ErrorHandler {
    return { handle: (err, _req, res) => res.status(500).json(`{"message":"${(err as any)?.message ?? 'Unknown Error'}"}`) };
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

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  setErrorHandler(errorHandler: ErrorHandler): this {
    this.errorHandler = errorHandler;
    return this;
  }
}
