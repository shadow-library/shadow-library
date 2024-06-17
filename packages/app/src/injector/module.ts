/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';
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

export enum ModuleState {
  CREATED,
  INITIALIZING,
  INITIALIZED,
  DESTROYING,
  DESTROYED,
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

  private status = ModuleState.CREATED;

  constructor(metatype: Type, imports: Module[]) {
    this.metatype = metatype;
    this.imports = imports;

    const exports = InjectorUtils.getMetadata<InjectionName>(MODULE_METADATA.EXPORTS, metatype);
    this.exports = new Set(exports);
  }

  private getProvider(name: InjectionName): object;
  private getProvider(name: InjectionName, optional: boolean): object | null;
  private getProvider(name: InjectionName, optional?: boolean): object | null {
    const provider = this.providers.get(name);
    if (provider) return provider;

    for (const module of this.imports) {
      const provider = module.getExportedProvider(name);
      if (provider) return provider;
    }

    if (!optional) {
      const provider = typeof name === 'function' ? name.name : name.toString();
      throw new InternalError(`Provider '${provider}' not found in module '${this.metatype.name}'`);
    }
    return null;
  }

  getState(): ModuleState {
    return this.status;
  }

  getExportedProvider(name: InjectionName): object | null {
    const isExported = this.exports.has(name);
    if (!isExported) return null;
    return this.getProvider(name) ?? null;
  }

  async init(): Promise<void> {
    this.status = ModuleState.INITIALIZING;

    /** Determining the order to initiate the providers */
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

      const instances = [];
      for (const injection of provider.inject) {
        const instance = this.getProvider(injection.name, injection.optional);
        instances.push(instance);
      }

      const providerInstance = await provider.useFactory(...instances);
      this.providers.set(provider.name, providerInstance);
    }

    /** Initializing the controllers */
    const controllers = InjectorUtils.getMetadata<Type>(MODULE_METADATA.CONTROLLERS, this.metatype);
    for (const controller of controllers) {
      const valid = isController(controller);
      if (!valid) throw new InternalError(`Class '${controller.name}' is not a controller`);
      const dependencyNames = InjectorUtils.getMetadata<Type>(PARAMTYPES_METADATA, controller);
      const dependencies = dependencyNames.map(name => this.getProvider(name));
      const controllerInstance = new controller(...dependencies);
      this.controllers.set(controller, controllerInstance);
    }

    this.status = ModuleState.INITIALIZED;
  }
}
