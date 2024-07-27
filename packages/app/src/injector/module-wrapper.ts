/**
 * Importing npm packages
 */
import { Logger } from '@shadow-library/common';
import { InternalError, NeverError } from '@shadow-library/errors';
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { ControllerWrapper } from './controller-wrapper';
import { DependencyGraph } from './dependency-graph';
import { Extractor, Parser } from './helpers';
import { MODULE_METADATA, PARAMTYPES_METADATA } from '../constants';
import { InjectionName, Provider } from '../interfaces';

/**
 * Defining types
 */

export enum LifecycleMethods {
  ON_MODULE_INIT = 'onModuleInit',
  ON_MODULE_DESTROY = 'onModuleDestroy',
  ON_APPLICATION_READY = 'onApplicationReady',
  ON_APPLICATION_STOP = 'onApplicationStop',
}

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('ShadowModule');

export class ModuleWrapper {
  private readonly metatype: Type;
  private readonly imports: ModuleWrapper[];

  private readonly controllers = new Array<ControllerWrapper>();
  private readonly providers = new Map<InjectionName, object>();
  private readonly exports = new Set<InjectionName>();

  private instance?: object;

  constructor(metatype: Type, imports: ModuleWrapper[]) {
    this.metatype = metatype;
    this.imports = imports;

    const exports = Extractor.getMetadata<InjectionName>(MODULE_METADATA.EXPORTS, metatype);
    this.exports = new Set(exports);
    logger.debug(`Module '${metatype.name}' created`);
  }

  private getProvider<T = object>(name: InjectionName): T;
  private getProvider<T = object>(name: InjectionName, optional: boolean): T | undefined;
  private getProvider<T = object>(name: InjectionName, optional?: boolean): T | undefined {
    const provider = this.providers.get(name) as T | undefined;
    if (provider) return provider;

    for (const module of this.imports) {
      const provider = module.getExportedProvider<T>(name);
      if (provider) return provider;
    }

    if (!optional) throw new InternalError(`Provider '${Extractor.getProviderName(name)}' not found in module '${this.metatype.name}'`);
    return;
  }

  async runLifecycleMethod(method: LifecycleMethods): Promise<this> {
    if (!this.instance) throw new NeverError(`Module '${this.metatype.name}' not yet initialized`);
    logger.debug(`Executing lifecycle method '${method}' in module '${this.metatype.name}'`);

    const instances = [...this.providers.values(), ...this.controllers.values(), this.instance];
    if (method === LifecycleMethods.ON_MODULE_DESTROY) instances.reverse();
    for (const instance of instances) {
      const hasMethod = typeof instance === 'object' && method in instance && typeof (instance as any)[method] === 'function';
      if (hasMethod) {
        await (instance as any)[method]();
        logger.debug(`Executed lifecycle method '${instance.constructor.name}.${method}()'`);
      }
    }

    return this;
  }

  isInited(): boolean {
    return typeof this.instance === 'object';
  }

  getInstance(): object {
    if (!this.instance) throw new NeverError(`Module '${this.metatype.name}' not yet initialized`);
    return this.instance;
  }

  getExportedProvider<T = object>(name: InjectionName): T | undefined {
    if (!this.isInited()) throw new NeverError(`Module '${this.metatype.name}' not yet initialized`);
    const isExported = this.exports.has(name);
    if (!isExported) return;
    return this.getProvider(name, true);
  }

  getControllers(): ControllerWrapper[] {
    if (!this.isInited()) throw new NeverError(`Module '${this.metatype.name}' not yet initialized`);
    return [...this.controllers];
  }

  async destroy(): Promise<this> {
    if (!this.isInited()) return this;
    await this.runLifecycleMethod(LifecycleMethods.ON_MODULE_DESTROY);
    this.instance = undefined;
    this.providers.clear();
    this.controllers.length = 0;
    return this;
  }

  async init(): Promise<this> {
    /** Determining the order to initiate the providers */
    logger.debug(`Determining the order to initialize providers for module '${this.metatype.name}'`);
    const providers = Extractor.getMetadata<Provider>(MODULE_METADATA.PROVIDERS, this.metatype);
    const parsedProviders = providers.map(p => Parser.parseProvider(p));
    const dependencyGraph = new DependencyGraph<InjectionName>();
    for (const provider of parsedProviders) {
      dependencyGraph.addNode(provider.name);
      for (const injection of provider.inject) {
        dependencyGraph.addNode(injection.name);
        dependencyGraph.addDependency(provider.name, injection.name);
      }
    }
    const initOrder = dependencyGraph.getSortedNodes();

    /** Initializing the providers */
    for (const providerName of initOrder) {
      const provider = parsedProviders.find(p => p.name === providerName);
      if (!provider) continue;

      logger.debug(`Initializing provider '${Extractor.getProviderName(providerName)}'`);
      const instances = [];
      for (const injection of provider.inject) {
        const instance = this.getProvider(injection.name, injection.optional);
        instances.push(instance);
      }

      const providerInstance = await provider.useFactory(...instances);
      this.providers.set(provider.name, providerInstance);
      logger.debug(`Provider '${Extractor.getProviderName(providerName)}' initialized`);
    }

    /** Initializing the controllers */
    const controllers = Extractor.getMetadata<Type>(MODULE_METADATA.CONTROLLERS, this.metatype);
    for (const controller of controllers) {
      logger.debug(`Initializing controller '${controller.name}'`);
      const dependencyNames = Extractor.getMetadata<Type>(PARAMTYPES_METADATA, controller);
      const dependencies = dependencyNames.map(name => this.getProvider(name));
      const controllerWrapper = new ControllerWrapper(controller, dependencies);
      this.controllers.push(controllerWrapper);
      logger.debug(`Controller '${controller.name}' initialized`);
    }

    /** Initializing the module instance */
    logger.debug(`Initializing Module '${this.metatype.name}'`);
    const dependencyNames = Extractor.getMetadata<Type>(PARAMTYPES_METADATA, this.metatype);
    const dependencies = dependencyNames.map(name => this.getProvider(name));
    this.instance = new this.metatype(...dependencies);
    logger.debug(`Module '${this.metatype.name}' initialized`);

    return await this.runLifecycleMethod(LifecycleMethods.ON_MODULE_INIT);
  }
}
