/**
 * Importing npm packages
 */
import { InternalError, Logger } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { DIErrors, isClassProvider, isFactoryProvider, isValueProvider } from './helpers';
import { INJECTABLE_WATERMARK, OPTIONAL_DEPS_METADATA, PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA, TRANSIENT_METADATA } from '../constants';
import { InjectMetadata } from '../decorators';
import { FactoryDependency, FactoryProvider, InjectionToken, Provider } from '../interfaces';
import { ContextId, createContextId } from '../utils';

/**
 * Defining types
 */

export interface InjectionMetadata extends FactoryDependency {
  forwardRef?: boolean;
  contextId?: ContextId;
}

export type Factory<T extends object> = (...args: any[]) => T | Promise<T>;

export interface InstancePerContext<T extends object> {
  instance: T;
  resolved: boolean;
}

/**
 * Declaring the constants
 */
const STATIC_CONTEXT: ContextId = Object.freeze({ id: 0 });

export class InstanceWrapper<T extends object = any> {
  private readonly logger = Logger.getLogger(InstanceWrapper.name);

  private readonly token: InjectionToken;
  private readonly inject: InjectionMetadata[];
  private readonly metatype?: Class<T> | Factory<T>;

  private readonly transient: boolean = false;
  private readonly isFactory: boolean = false;

  private readonly dependecies = new Array<InstanceWrapper | null>();
  private readonly instances = new Map<ContextId, InstancePerContext<T>>();

  constructor(provider: Provider) {
    if (isValueProvider(provider)) {
      this.inject = [];
      this.token = provider.token;
      this.instances.set(STATIC_CONTEXT, { instance: provider.useValue, resolved: true });
      this.logger.debug(`Instance '${this.token.toString()}' created`);
      return;
    }

    if (isFactoryProvider(provider)) {
      this.isFactory = true;
      this.token = provider.token;
      this.metatype = provider.useFactory;
      this.inject = this.getFactoryDependencies(provider.inject);
      return;
    }

    const { token, useClass: Class } = isClassProvider(provider) ? provider : { token: provider, useClass: provider };
    const injectable = Reflect.hasMetadata(INJECTABLE_WATERMARK, Class);
    if (!injectable) throw new InternalError(`Class '${Class.name}' is not an injectable provider`);

    this.token = token;
    this.metatype = Class;
    this.inject = this.getClassDependencies(Class);
    this.transient = Reflect.getMetadata(TRANSIENT_METADATA, Class) ?? false;
    if (!this.transient) {
      const instance = Object.create(Class.prototype);
      this.instances.set(STATIC_CONTEXT, { instance, resolved: false });
    }
  }

  private getFactoryDependencies(deps: FactoryProvider['inject']): InjectionMetadata[] {
    if (!deps) return [];
    const index = deps.findIndex(d => d === undefined);
    if (index !== -1) return DIErrors.undefinedDependency(this.token, index);

    return deps.map(d => (typeof d === 'object' && 'token' in d ? d : { token: d, optional: false }));
  }

  private getInjectedToken(injectMetadata: InjectMetadata): InjectionMetadata {
    if (typeof injectMetadata.token === 'object' && 'forwardRef' in injectMetadata.token) {
      const token = injectMetadata.token.forwardRef();
      return { token, optional: false, forwardRef: true };
    }

    return { token: injectMetadata.token, optional: false };
  }

  private getClassDependencies(Class: Class<unknown>): InjectionMetadata[] {
    const dependencies = [] as InjectionMetadata[];
    const paramtypes: Class<unknown>[] = Reflect.getMetadata(PARAMTYPES_METADATA, Class) ?? [];
    const selfDependencies: InjectMetadata[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, Class) ?? [];
    const optionalDependencies: number[] = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, Class) ?? [];
    for (const dependency of paramtypes) dependencies.push({ token: dependency, optional: false });
    for (const dependency of selfDependencies) dependencies[dependency.index] = this.getInjectedToken(dependency);
    for (const index of optionalDependencies) dependencies[index]!.optional = true;
    return dependencies;
  }

  getToken(): InjectionToken {
    return this.token;
  }

  getTokenName(): string {
    const token = this.token as any;
    return token.name ?? token.toString();
  }

  isTransient(): boolean {
    return this.transient;
  }

  getDependencies(): InjectionMetadata[] {
    return this.inject;
  }

  setDependency(index: number, provider?: InstanceWrapper): this {
    this.dependecies[index] = provider ?? null;
    return this;
  }

  getInstance(contextId: ContextId = STATIC_CONTEXT): T {
    const instancePerContext = this.instances.get(contextId);
    if (!instancePerContext) throw new InternalError(`Instance of '${this.getTokenName()}' not found`);
    return instancePerContext.instance;
  }

  loadPrototype(contextId: ContextId = STATIC_CONTEXT): T {
    const name = this.getTokenName();
    if (this.isFactory) throw new InternalError(`Factory provider '${name}' cannot be used as a prototype`);

    const instancePerContext = this.instances.get(contextId);
    if (instancePerContext) return instancePerContext.instance;

    const prototype = Object.create(this.metatype?.prototype);
    this.instances.set(contextId, { instance: prototype, resolved: false });
    return prototype;
  }

  async loadInstance(contextId: ContextId = STATIC_CONTEXT): Promise<T> {
    const instancePerContext = this.instances.get(contextId);
    if (instancePerContext?.resolved) return instancePerContext.instance;

    const name = this.token.toString();
    this.logger.debug(`Loading instance of '${name}'`);
    if (this.dependecies.length !== this.inject.length) throw new InternalError(`Dependency of '${name}' not yet set`);

    const dependecies = [];
    for (let index = 0; index < this.inject.length; index++) {
      const metadata = this.inject[index] as InjectionMetadata;
      const dependency = this.dependecies[index];
      let instance: T | undefined;
      if (dependency) {
        if (dependency.isTransient()) metadata.contextId = createContextId();
        instance = metadata.forwardRef ? dependency.loadPrototype(metadata.contextId) : await dependency.loadInstance(metadata.contextId);
      }
      dependecies.push(instance);
    }

    let instance: T;
    if (this.isFactory) instance = await (this.metatype as Factory<T>)(...dependecies);
    else instance = new (this.metatype as Class<T>)(...dependecies);
    if (instancePerContext) instance = Object.assign(instancePerContext.instance, instance);
    this.instances.set(contextId, { instance, resolved: true });
    this.logger.debug(`Instance '${name}' loaded`);

    return instance;
  }
}
