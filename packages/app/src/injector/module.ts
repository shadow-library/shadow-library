/**
 * Importing npm packages
 */
import { Logger } from '@shadow-library/common';
import { InternalError, NeverError } from '@shadow-library/errors';
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { DependencyGraph } from './dependency-graph';
import { InjectorUtils } from './injector.utils';
import { CONTROLLER_WATERMARK, INJECTABLE_WATERMARK, MODULE_METADATA, OPTIONAL_DEPS_METADATA, PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from '../constants';
import { InjectMetadata } from '../decorators';
import { FactoryProvider, FactoryProviderInject, InjectionName, Provider } from '../interfaces';

/**
 * Defining types
 */

export enum LifecycleMethods {
  ON_MODULE_INIT = 'onModuleInit',
  ON_MODULE_DESTROY = 'onModuleDestroy',
  ON_APPLICATION_READY = 'onApplicationReady',
  ON_APPLICATION_STOP = 'onApplicationStop',
}

export interface Controller {
  type: Type;
  instance: object;
}

interface ParsedInjection {
  name: InjectionName;
  optional: boolean;
}

interface ParsedProvider {
  name: InjectionName;
  useFactory: (...args: any[]) => any | Promise<any>;
  inject: ParsedInjection[];
}

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('ShadowModule');
const isInjectable = (provider: Type): boolean => Reflect.getMetadata(INJECTABLE_WATERMARK, provider) ?? false;
const isController = (provider: Type): boolean => Reflect.hasMetadata(CONTROLLER_WATERMARK, provider);
const isFactoryProvider = (provider: Provider): provider is FactoryProvider => 'useFactory' in provider;

function parseInjection(injection: FactoryProviderInject): ParsedInjection {
  if (typeof injection === 'object' && 'name' in injection) return { name: injection.name, optional: injection.optional ?? false };
  return { name: injection, optional: false };
}

function parseProvider(provider: Provider): ParsedProvider {
  if ('useValue' in provider) return { name: provider.name, useFactory: () => provider.useValue, inject: [] };

  if (isFactoryProvider(provider)) {
    const inject = provider.inject ?? [];
    return { name: provider.name, useFactory: provider.useFactory, inject: inject.map(parseInjection) };
  }

  const classProvider = typeof provider === 'function' ? { name: provider, useClass: provider } : provider;
  const injectable = isInjectable(classProvider.useClass);
  if (!injectable) throw new InternalError(`Class '${classProvider.useClass.name}' is not an injectable provider`);
  const dependencies = InjectorUtils.getMetadata<FactoryProviderInject>(PARAMTYPES_METADATA, classProvider.useClass);
  const selfDependencies = InjectorUtils.getMetadata<InjectMetadata>(SELF_DECLARED_DEPS_METADATA, classProvider.useClass);
  for (const dependency of selfDependencies) dependencies[dependency.index] = dependency.name;
  const optionalDependencies = InjectorUtils.getMetadata<number>(OPTIONAL_DEPS_METADATA, classProvider.useClass);
  for (const index of optionalDependencies) {
    const dependency = dependencies[index] as FactoryProviderInject;
    const name = typeof dependency === 'object' && 'name' in dependency ? dependency.name : dependency;
    dependencies[index] = { name, optional: true };
  }

  const inject = dependencies.map(parseInjection);
  return { name: classProvider.name, useFactory: (...args: any) => new classProvider.useClass(...args), inject };
}

export class Module {
  private readonly metatype: Type;
  private readonly imports: Module[];

  private readonly controllers = new Map<Type, object>();
  private readonly providers = new Map<InjectionName, object>();
  private readonly exports = new Set<InjectionName>();

  private instance?: object;

  constructor(metatype: Type, imports: Module[]) {
    this.metatype = metatype;
    this.imports = imports;

    const exports = InjectorUtils.getMetadata<InjectionName>(MODULE_METADATA.EXPORTS, metatype);
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

    if (!optional) throw new InternalError(`Provider '${InjectorUtils.getProviderName(name)}' not found in module '${this.metatype.name}'`);
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

  getControllers(): Controller[] {
    if (!this.isInited()) throw new NeverError(`Module '${this.metatype.name}' not yet initialized`);
    return [...this.controllers.entries()].map(([type, instance]) => ({ type, instance }));
  }

  async destroy(): Promise<this> {
    if (!this.isInited()) return this;
    await this.runLifecycleMethod(LifecycleMethods.ON_MODULE_DESTROY);
    this.instance = undefined;
    this.providers.clear();
    this.controllers.clear();
    return this;
  }

  async init(): Promise<this> {
    /** Determining the order to initiate the providers */
    logger.debug(`Determining the order to initialize providers for module '${this.metatype.name}'`);
    const providers = InjectorUtils.getMetadata<Provider>(MODULE_METADATA.PROVIDERS, this.metatype);
    const parsedProviders = providers.map(parseProvider);
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

      logger.debug(`Initializing provider '${InjectorUtils.getProviderName(providerName)}'`);
      const instances = [];
      for (const injection of provider.inject) {
        const instance = this.getProvider(injection.name, injection.optional);
        instances.push(instance);
      }

      const providerInstance = await provider.useFactory(...instances);
      this.providers.set(provider.name, providerInstance);
      logger.debug(`Provider '${InjectorUtils.getProviderName(providerName)}' initialized`);
    }

    /** Initializing the controllers */
    const controllers = InjectorUtils.getMetadata<Type>(MODULE_METADATA.CONTROLLERS, this.metatype);
    for (const controller of controllers) {
      const valid = isController(controller);
      if (!valid) throw new InternalError(`Class '${controller.name}' is not a controller`);
      logger.debug(`Initializing controller '${controller.name}'`);
      const dependencyNames = InjectorUtils.getMetadata<Type>(PARAMTYPES_METADATA, controller);
      const dependencies = dependencyNames.map(name => this.getProvider(name));
      const controllerInstance = new controller(...dependencies);
      this.controllers.set(controller, controllerInstance);
      logger.debug(`Controller '${controller.name}' initialized`);
    }

    /** Initializing the module instance */
    logger.debug(`Initializing Module '${this.metatype.name}'`);
    const dependencyNames = InjectorUtils.getMetadata<Type>(PARAMTYPES_METADATA, this.metatype);
    const dependencies = dependencyNames.map(name => this.getProvider(name));
    this.instance = new this.metatype(...dependencies);
    logger.debug(`Module '${this.metatype.name}' initialized`);

    return await this.runLifecycleMethod(LifecycleMethods.ON_MODULE_INIT);
  }
}
