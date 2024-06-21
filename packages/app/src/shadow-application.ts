/**
 * Importing npm packages
 */
import { Logger } from '@shadow-library/common';
import { InternalError } from '@shadow-library/errors';
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { MODULE_METADATA, MODULE_WATERMARK } from './constants';
import { DependencyGraph, InjectorUtils, LifecycleMethods, Module } from './injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('ShadowApplication');

export class ShadowApplication {
  private readonly modules = new Map<Type, Module>();
  private readonly main: Module;

  constructor(module: Type) {
    this.main = this.scanForModules(module);
    logger.debug('Modules scanned successfully');
  }

  private scanForModules(module: Type): Module {
    if (this.modules.has(module)) return this.modules.get(module) as Module;
    const isModule = Reflect.getMetadata(MODULE_WATERMARK, module) ?? false;
    if (!isModule) throw new Error(`Class '${module.name}' is not a module`);
    const dependencies = InjectorUtils.getMetadata<Type>(MODULE_METADATA.IMPORTS, module);
    const dependentModules = dependencies.map(m => this.scanForModules(m));
    const moduleInstance = new Module(module, dependentModules);
    this.modules.set(module, moduleInstance);
    return moduleInstance;
  }

  isInited(): boolean {
    return this.main.isInited();
  }

  async init(): Promise<this> {
    if (this.isInited()) return this;

    logger.debug('Initializing application');
    const dependencyGraph = new DependencyGraph<Type>();
    const modules = Array.from(this.modules.keys());
    for (const module of modules) {
      dependencyGraph.addNode(module);
      const dependencies = InjectorUtils.getMetadata<Type>(MODULE_METADATA.IMPORTS, module);
      for (const dependency of dependencies) dependencyGraph.addDependency(module, dependency);
    }
    const sortedModules = dependencyGraph.getSortedNodes();

    for (const module of sortedModules) {
      const moduleInstance = this.modules.get(module) as Module;
      await moduleInstance.init();
    }

    logger.debug('Application initialized');
    for (const module of this.modules.values()) await module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_READY);
    return this;
  }

  async start(): Promise<this> {
    if (!this.isInited()) await this.init();
    const instance = this.main.getInstance();
    const isExecutable = 'execute' in instance && typeof (instance as any).execute === 'function';
    if (isExecutable) await (instance as any).execute();
    return this;
  }

  async stop(): Promise<this> {
    if (!this.isInited()) return this;
    logger.debug('Stopping application');
    for (const module of this.modules.values()) await module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_STOP);
    const modules = Array.from(this.modules.values()).reverse();
    for (const module of modules) await module.destroy();
    this.modules.clear();
    logger.debug('Application stopped');
    return this;
  }

  get<TInput = any, TResult = TInput>(provider: Type<TInput> | string | symbol): TResult {
    if (!this.isInited()) throw new InternalError(`Application not yet initialized`);
    for (const module of this.modules.values()) {
      try {
        const providerInstance = module.getExportedProvider<TResult>(provider);
        if (providerInstance) return providerInstance;
      } catch {} // eslint-disable-line no-empty
    }

    const providerName = typeof provider === 'function' ? provider.name : provider.toString();
    throw new InternalError(`Provider '${providerName}' not found or exported`);
  }
}
