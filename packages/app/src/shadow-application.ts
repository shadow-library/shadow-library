/**
 * Importing npm packages
 */
import { InternalError, Logger } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { GLOBAL_WATERMARK, MODULE_METADATA, MODULE_WATERMARK } from './constants';
import { DependencyGraph, Extractor, LifecycleMethods, ModuleWrapper } from './injector';
import { ApplicationConfig } from './interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowApplication {
  private readonly globalModuleType?: Class<unknown>;
  private readonly modules = new Map<Class<unknown>, ModuleWrapper>();
  private readonly main: ModuleWrapper;
  private readonly logger: Logger;
  private readonly config: ApplicationConfig;

  constructor(module: Class<unknown>, config: ApplicationConfig = {}) {
    this.logger = Logger.getLogger('shadow-app');
    this.config = { ...config };
    this.globalModuleType = this.scanForGlobalModule(module);
    this.main = this.scanForModules(module);
    this.logger.debug('Modules scanned successfully');
  }

  private scanForGlobalModule(module: Class<unknown>): Class<unknown> | undefined {
    const imports = Extractor.getMetadata<Class<unknown>>(MODULE_METADATA.IMPORTS, module);
    const [globalModule, ...others] = imports.filter(m => Reflect.getMetadata(GLOBAL_WATERMARK, m) ?? false);
    if (!globalModule) return;
    if (others.length > 0) throw new InternalError('There can only be one global module');

    const moduleInstance = new ModuleWrapper(globalModule, []);
    this.modules.set(globalModule, moduleInstance);
    return globalModule;
  }

  private scanForModules(module: Class<unknown>): ModuleWrapper {
    if (this.modules.has(module)) return this.modules.get(module) as ModuleWrapper;

    const isModule = Reflect.getMetadata(MODULE_WATERMARK, module) ?? false;
    if (!isModule) throw new InternalError(`Class '${module.name}' is not a module`);
    const isGlobal = Reflect.getMetadata(GLOBAL_WATERMARK, module) ?? false;
    if (isGlobal) throw new InternalError(`Global module '${module.name}' can only be imported in main module`);

    const dependencies = Extractor.getMetadata<Class<unknown>>(MODULE_METADATA.IMPORTS, module);
    if (this.globalModuleType && !dependencies.includes(this.globalModuleType)) dependencies.unshift(this.globalModuleType);
    if (dependencies.some(m => m === undefined)) {
      const missingModules = dependencies.filter(m => m === undefined).map((_, i) => i);
      throw new InternalError(`Module '${module.name}' has missing dependencies at index: ${missingModules.join(', ')}. This might be due to circular dependency`);
    }

    const dependentModules = dependencies.map(m => this.scanForModules(m));
    const moduleInstance = new ModuleWrapper(module, dependentModules);
    this.modules.set(module, moduleInstance);

    return moduleInstance;
  }

  isInited(): boolean {
    return this.main.isInited();
  }

  async init(): Promise<this> {
    if (this.isInited()) return this;

    this.logger.debug('Initializing application');
    const dependencyGraph = new DependencyGraph<Class<unknown>>();
    const modules = Array.from(this.modules.keys());
    for (const module of modules) {
      dependencyGraph.addNode(module);
      const dependencies = Extractor.getMetadata<Class<unknown>>(MODULE_METADATA.IMPORTS, module);
      for (const dependency of dependencies) dependencyGraph.addDependency(module, dependency);
    }
    const sortedModules = dependencyGraph.getSortedNodes();

    const router = this.config.router;
    const routers = Array.isArray(router) ? router : router !== undefined ? [router] : [];
    for (const module of sortedModules) {
      const moduleInstance = this.modules.get(module) as ModuleWrapper;
      await moduleInstance.init();
      const controllers = moduleInstance.getControllers();
      if (routers.length === 0) continue;

      const routes = controllers.flatMap(controller => controller.getRoutes());
      if (routes.length === 0) continue;

      for (const router of routers) {
        this.logger.debug(`Registering routes for router '${router.constructor.name}'`);
        for (const route of routes) {
          const valid = route.metadata[router.identifier] === true;
          if (valid) await router.register(route);
        }
      }
    }

    this.logger.debug('Application initialized');
    for (const module of this.modules.values()) await module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_READY);
    return this;
  }

  async start(): Promise<this> {
    if (!this.isInited()) await this.init();
    const instance = this.main.getInstance();
    const isExecutable = 'execute' in instance && typeof (instance as any).execute === 'function';
    if (isExecutable) await (instance as any).execute(this, this.config.router);
    return this;
  }

  async stop(): Promise<this> {
    if (!this.isInited()) return this;
    this.logger.debug('Stopping application');
    for (const module of this.modules.values()) await module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_STOP);
    const modules = Array.from(this.modules.values()).reverse();
    for (const module of modules) await module.destroy();
    this.modules.clear();
    this.logger.debug('Application stopped');
    return this;
  }

  get<TInput = any, TResult = TInput>(provider: Class<TInput> | string | symbol): TResult {
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
