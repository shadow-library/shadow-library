/**
 * Importing npm packages
 */
import { InternalError, Logger } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { MODULE_METADATA, MODULE_WATERMARK } from './constants';
import { DIErrors, DependencyGraph, Extractor, LifecycleMethods, ModuleWrapper } from './injector';
import { ApplicationConfig } from './interfaces';
import { ForwardReference } from './utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowApplication {
  private readonly modules = new Map<Class<unknown>, ModuleWrapper>();
  private readonly main: ModuleWrapper;
  private readonly logger: Logger;
  private readonly config: ApplicationConfig;

  constructor(module: Class<unknown>, config: ApplicationConfig = {}) {
    this.logger = Logger.getLogger('shadow-app');
    this.config = { ...config };
    this.main = this.scanForModules(module);
    this.logger.debug('Modules scanned successfully');
  }

  private getImports(module: Class<unknown>): Class<unknown>[] {
    const imports = Extractor.getMetadata<Class<unknown> | ForwardReference<Class<unknown>>>(MODULE_METADATA.IMPORTS, module);
    if (imports.some(m => m === undefined)) {
      const index = imports.findIndex(m => m === undefined);
      return DIErrors.undefinedDependency(module, index);
    }

    return imports.map(m => ('forwardRef' in m ? m.forwardRef() : m));
  }

  private scanForModules(module: Class<unknown>): ModuleWrapper {
    if (this.modules.has(module)) return this.modules.get(module) as ModuleWrapper;

    const isModule = Reflect.getMetadata(MODULE_WATERMARK, module) ?? false;
    if (!isModule) throw new InternalError(`Class '${module.name}' is not a module`);

    const dependencies = this.getImports(module);
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
      const dependencies = this.getImports(module);
      for (const dependency of dependencies) dependencyGraph.addDependency(module, dependency);
    }
    const sortedModules = dependencyGraph.getInitOrder();

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
