/**
 * Importing npm packages
 */
import { InternalError, Logger } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { DIErrors, DependencyGraph } from './helpers';
import { Module } from './module';
import { MODULE_METADATA, MODULE_WATERMARK } from '../constants';
import { ForwardReference } from '../utils';

/**
 * Defining types
 */

type TModule = Class<unknown>;

type Import = Class<unknown> | ForwardReference<Class<unknown>>;

/**
 * Declaring the constants
 */

export class ModuleRegistry {
  private readonly logger = Logger.getLogger(ModuleRegistry.name);
  private readonly modules = new Map<TModule, Module>();

  constructor(private readonly main: TModule) {
    const modules = this.scan(main);
    for (const module of modules) this.modules.set(module.getMetatype(), module);
  }

  private reflectImports(module: TModule): Import[] {
    const imports: Import[] = Reflect.getMetadata(MODULE_METADATA.IMPORTS, module) ?? [];
    const index = imports.findIndex(m => m === undefined);
    if (index !== -1) return DIErrors.undefinedDependency(module, index);

    const modules = imports.map(m => ('forwardRef' in m ? m.forwardRef() : m));
    for (const mod of modules) {
      const isModule = Reflect.hasMetadata(MODULE_WATERMARK, mod);
      if (!isModule) throw new InternalError(`Class '${mod.name}' is not a module, but is imported by '${module.name}'`);
    }

    return imports;
  }

  private scan(module: TModule): Module[] {
    const graph = new DependencyGraph<TModule>();
    const modules = new Map<TModule, Module>();

    const scanModule = (module: TModule): Module => {
      if (modules.has(module)) return modules.get(module) as Module;

      this.logger.debug(`Scanning module '${module.name}'`);
      const imports: TModule[] = [];
      for (const mod of this.reflectImports(module)) {
        if ('forwardRef' in mod) {
          graph.addNode(mod.forwardRef());
          imports.push(mod.forwardRef());
        } else {
          graph.addDependency(module, mod);
          imports.push(mod);
        }
      }

      const instance = new Module(module);
      modules.set(module, instance);
      const dependencies = imports.map(m => scanModule(m));
      dependencies.forEach(d => instance.addImport(d));

      this.logger.debug(`Module '${module.name}' scanned`);

      return instance;
    };

    scanModule(module);
    const initOrder = graph.getInitOrder();
    return initOrder.map(m => modules.get(m) as Module);
  }

  async init(): Promise<void> {
    const modules = this.modules.values();

    this.logger.debug('Initializing the modules');
    for (const module of modules) await module.init();
    this.logger.debug('Modules initialized');
  }
}
