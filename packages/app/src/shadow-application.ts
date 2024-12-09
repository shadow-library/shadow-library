/**
 * Importing npm packages
 */
import { InternalError, Logger, tryCatch } from '@shadow-library/common';
import { AbstractClass, Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { InstanceWrapper, ModuleRef, ModuleRegistry } from './injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowApplication {
  private readonly logger = Logger.getLogger(ShadowApplication.name);

  private readonly main: Class<unknown>;
  private readonly registry: ModuleRegistry;

  constructor(module: Class<unknown>) {
    this.main = module;
    this.registry = new ModuleRegistry(module);
  }

  isInited(): boolean {
    const main = this.registry.get(this.main);
    return main.isInited();
  }

  async init(): Promise<this> {
    if (this.isInited()) return this;
    await this.registry.init();
    return this;
  }

  async start(): Promise<this> {
    if (!this.isInited()) await this.init();
    this.logger.debug('Starting application');
    const modules = this.registry.get();
    const start = modules.map(module => module.start());
    await Promise.all(start);
    this.logger.debug('Application started');
    return this;
  }

  async stop(): Promise<this> {
    if (!this.isInited()) return this;
    this.logger.debug('Stopping application');
    await this.registry.terminate();
    this.logger.debug('Application stopped');
    return this;
  }

  select(module: Class<any>): ModuleRef {
    const mod = this.registry.get(module);
    const moduleRef = mod['getInternalProvider'](ModuleRef) as InstanceWrapper;
    return moduleRef.getInstance();
  }

  get<TInput = any, TResult = TInput>(provider: Class<TInput> | AbstractClass<TInput> | string | symbol): TResult {
    if (!this.isInited()) throw new InternalError(`Application not yet initialized`);
    const modules = this.registry.get();
    for (const module of modules) {
      const result = tryCatch(() => module.getProvider(provider));
      if (result.success) return result.data.getInstance() as TResult;
    }

    const providerName = typeof provider === 'function' ? provider.name : provider.toString();
    throw new InternalError(`Provider '${providerName}' not found or exported`);
  }
}
