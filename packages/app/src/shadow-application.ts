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
import { DependencyGraph, InjectorUtils, Module } from './injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const logger = Logger.getLogger('ShadowApplication');

export class ShadowApplication {
  private readonly modules = new Map<Type, Module>();

  private inited = false;

  constructor(module: Type) {
    this.scanForModules(module);
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
    return this.inited;
  }

  getModules(): Type[] {
    return Array.from(this.modules.keys());
  }

  async init(): Promise<this> {
    if (this.inited) return this;

    logger.debug('Initializing application');
    const dependencyGraph = new DependencyGraph<Type>();
    const modules = Array.from(this.modules.keys());
    for (const module of modules) {
      const dependencies = InjectorUtils.getMetadata<Type>(MODULE_METADATA.IMPORTS, module);
      for (const dependency of dependencies) dependencyGraph.addDependency(module, dependency);
    }
    const sortedModules = dependencyGraph.getSortedNodes();

    for (const module of sortedModules) {
      const moduleInstance = this.modules.get(module) as Module;
      await moduleInstance.init();
    }

    this.inited = true;
    logger.debug('Application initialized');
    return this;
  }

  get<TInput = any, TResult = TInput>(provider: Type<TInput> | string | symbol): TResult {
    for (const module of this.modules.values()) {
      const providerInstance = module.getExportedProvider<TResult>(provider);
      if (providerInstance) return providerInstance;
    }

    const providerName = typeof provider === 'function' ? provider.name : provider.toString();
    throw new InternalError(`Provider '${providerName}' not found or exported`);
  }
}
