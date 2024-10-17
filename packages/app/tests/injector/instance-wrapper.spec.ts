/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it } from '@jest/globals';
import { InternalError, NeverError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Inject, Injectable, Optional, createContextId, forwardRef } from '@shadow-library/app';
import { InstanceWrapper } from '@shadow-library/app/injector';

/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

describe('InstanceWrapper', () => {
  let instanceWrapper: InstanceWrapper;

  describe('Value Provider', () => {
    const provider = { token: 'CONFIG', useValue: 'CONFIG_VALUE' };

    beforeEach(() => {
      instanceWrapper = new InstanceWrapper(provider);
    });

    it('should create an instance during initialization', () => {
      const instances = Array.from(instanceWrapper['instances'].values());
      expect(instances).toStrictEqual([{ instance: provider.useValue, resolved: true }]);
    });

    it('should return the provider for loadPrototype()', () => {
      expect(instanceWrapper.loadPrototype()).toBe(provider.useValue);
    });

    it('should return false for isTransient and isFactory', () => {
      expect(instanceWrapper.isTransient()).toBe(false);
      expect(instanceWrapper['isFactory']).toBe(false);
    });
  });

  describe('Class Provider', () => {
    @Injectable()
    class ClassProvider {}

    it('should throw an error if the class is not injectable', () => {
      class InvalidClassProvider {}
      expect(() => new InstanceWrapper(InvalidClassProvider, true)).toThrowError(InternalError);
    });

    it('should create an prototype instance during initialization', () => {
      const instanceWrapper = new InstanceWrapper(ClassProvider);
      const instances = Array.from(instanceWrapper['instances'].values());
      expect(instances).toStrictEqual([{ instance: expect.any(ClassProvider), resolved: false }]);
    });

    it('should handle alias tokens', () => {
      const provider = { token: 'CONFIG', useClass: ClassProvider };
      const instanceWrapper = new InstanceWrapper(provider);
      const instances = Array.from(instanceWrapper['instances'].values());
      expect(instanceWrapper.getToken()).toBe(provider.token);
      expect(instances).toStrictEqual([{ instance: expect.any(ClassProvider), resolved: false }]);
    });

    it('should identify transient provider', () => {
      @Injectable({ transient: true })
      class TransientProvider {}

      const instanceWrapper = new InstanceWrapper(TransientProvider);
      expect(instanceWrapper.isTransient()).toBe(true);
      expect(instanceWrapper['instances']).toHaveProperty('size', 0);
    });

    it('should identify the dependencies', () => {
      class ProviderOne {}
      class ProviderTwo {}
      class OptionalProvider {}

      @Injectable()
      class ClassProvider {
        constructor(
          public providerOne: ProviderOne,
          @Optional() public optionalProvider: OptionalProvider,
          public providerTwo: ProviderTwo,
          @Inject('CUSTOM') public customProvider: object,
          @Inject(forwardRef(() => ProviderOne)) public forwardedProvider: object,
        ) {}
      }

      const instanceWrapper = new InstanceWrapper(ClassProvider);
      expect(instanceWrapper.getDependencies()).toStrictEqual([
        { token: ProviderOne, optional: false },
        { token: OptionalProvider, optional: true },
        { token: ProviderTwo, optional: false },
        { token: 'CUSTOM', optional: false },
        { token: ProviderOne, optional: false, forwardRef: true },
      ]);
    });

    it('should return false for isFactory', () => {
      const instanceWrapper = new InstanceWrapper(ClassProvider);
      expect(instanceWrapper['isFactory']).toBe(false);
    });

    it('should load the instance', async () => {
      @Injectable()
      class ProviderOne {}

      @Injectable()
      class ProviderTwo {}

      @Injectable()
      class Provider {
        constructor(
          public readonly providerOne: ProviderOne,
          public readonly providerTwo: ProviderTwo,
        ) {}
      }

      const instanceWrapper = new InstanceWrapper(Provider);
      instanceWrapper.setDependency(0, new InstanceWrapper(ProviderOne));
      instanceWrapper.setDependency(1, new InstanceWrapper(ProviderTwo));
      const instance = await instanceWrapper.loadInstance();

      expect(instance).toBeInstanceOf(Provider);
      expect(instance.providerOne).toBeInstanceOf(ProviderOne);
      expect(instance.providerTwo).toBeInstanceOf(ProviderTwo);
    });

    it('should load the instance for forwardRef', async () => {
      @Injectable()
      class ProviderOne {
        constructor(@Inject(forwardRef(() => ProviderTwo)) public readonly providerTwo: object) {}
      }

      @Injectable()
      class ProviderTwo {
        constructor(@Inject(forwardRef(() => ProviderOne)) public readonly providerOne: object) {}
      }

      const providerOneWrapper = new InstanceWrapper(ProviderOne);
      const providerTwoWrapper = new InstanceWrapper(ProviderTwo);
      providerOneWrapper.setDependency(0, providerTwoWrapper);

      const instance = await providerOneWrapper.loadInstance();

      expect(instance).toBeInstanceOf(ProviderOne);
      expect(instance.providerTwo).toBeInstanceOf(ProviderTwo);
    });
  });

  describe('Factory Provider', () => {
    const provider = {
      token: Symbol('factory'),
      useFactory: (key: string, optional?: string) => 'CONFIG_VALUE' + key + optional,
      inject: ['DEPENDENCY', { token: 'OPTIONAL', optional: true }],
    };

    beforeEach(() => {
      instanceWrapper = new InstanceWrapper(provider);
    });

    it('should throw an error of undefined dependency', () => {
      const invalidPovider = { ...provider, inject: [...provider.inject, undefined] } as any;
      expect(() => new InstanceWrapper(invalidPovider)).toThrowError(InternalError);
    });

    it('should identify the dependencies', () => {
      expect(instanceWrapper.getDependencies()).toStrictEqual([
        { token: 'DEPENDENCY', optional: false },
        { token: 'OPTIONAL', optional: true },
      ]);
    });

    it('should return true for isFactory and false for isTransient', () => {
      expect(instanceWrapper['isFactory']).toBe(true);
      expect(instanceWrapper.isTransient()).toBe(false);
    });

    it('should throw an error if prototype is loaded', () => {
      expect(() => instanceWrapper.loadPrototype()).toThrowError(InternalError);
    });

    it('should load the instance', async () => {
      instanceWrapper.setDependency(0, new InstanceWrapper({ token: 'DEPENDENCY', useValue: 'DEPENDENCY_VALUE' }));
      const instance = await instanceWrapper.loadInstance();
      expect(instance).toBe('CONFIG_VALUE' + 'DEPENDENCY_VALUE' + undefined);
    });

    it('should load the instance when there are no dependencies', async () => {
      const instanceWrapper = new InstanceWrapper({ token: 'factory', useFactory: () => 'CONFIG_VALUE' });
      const instance = await instanceWrapper.loadInstance();
      expect(instance).toBe('CONFIG_VALUE');
    });
  });

  describe('Transient Provider', () => {
    @Injectable({ transient: true })
    class TransientProviderOne {}

    @Injectable()
    class Provider {
      constructor(public readonly transientProvider: TransientProviderOne) {}
    }

    @Injectable({ transient: true })
    class TransientProvider {
      constructor(
        public readonly provider: Provider,
        public readonly transientProvider: TransientProviderOne,
      ) {}
    }

    beforeEach(() => {
      instanceWrapper = new InstanceWrapper(TransientProvider);
      const providerWrapper = new InstanceWrapper(Provider);
      const transientProviderWrapper = new InstanceWrapper(TransientProviderOne);
      instanceWrapper.setDependency(0, providerWrapper);
      instanceWrapper.setDependency(1, transientProviderWrapper);
      providerWrapper.setDependency(0, transientProviderWrapper);
    });

    it('should return true for isTransient and false for isFactory', () => {
      expect(instanceWrapper.isTransient()).toBe(true);
      expect(instanceWrapper['isFactory']).toBe(false);
    });

    it('should load the instance', async () => {
      const instance = await instanceWrapper.loadInstance(createContextId());
      expect(instance).toBeInstanceOf(TransientProvider);
      expect(instance.provider).toBeInstanceOf(Provider);
      expect(instance.transientProvider).toBeInstanceOf(TransientProviderOne);
    });

    it('should load all the transient instances', async () => {
      @Injectable()
      class Provider {
        constructor(@Inject(forwardRef(() => TransientProvider)) public readonly transientProvider: object) {}
      }

      @Injectable({ transient: true })
      class TransientProvider {
        constructor(public readonly provider: Provider) {}
      }

      const providerWrapper = new InstanceWrapper(Provider);
      const transientProviderWrapper = new InstanceWrapper(TransientProvider);
      providerWrapper.setDependency(0, transientProviderWrapper);
      await providerWrapper.loadInstance();
      transientProviderWrapper.setDependency(0, providerWrapper);

      await transientProviderWrapper.loadAllInstances();

      const instances = Array.from(transientProviderWrapper['instances'].values());
      expect(instances).toStrictEqual([{ instance: expect.any(TransientProvider), resolved: true }]);
    });

    it('should return all the instances', async () => {
      await instanceWrapper.loadInstance();
      const instances = instanceWrapper['dependecies'][1]?.getAllInstances();
      expect(instances).toHaveLength(2);
    });

    it('should create a new instance for each context', async () => {
      const instanceOne = await instanceWrapper.loadInstance(createContextId());
      const instanceTwo = await instanceWrapper.loadInstance(createContextId());
      expect(instanceOne).not.toBe(instanceTwo);
    });

    it('should create and return an instance for the same context', async () => {
      const contextId = createContextId();
      const instanceOne = await instanceWrapper.loadInstance(contextId);
      const instanceTwo = await instanceWrapper.loadInstance(contextId);
      expect(instanceOne).toBe(instanceTwo);
    });
  });

  describe('General', () => {
    @Injectable()
    class Provider {
      constructor(@Inject('DEPENDENCY') public dependency: object) {}
    }

    beforeEach(() => {
      instanceWrapper = new InstanceWrapper(Provider);
      instanceWrapper.setDependency(0, new InstanceWrapper({ token: 'DEPENDENCY', useValue: 'DEPENDENCY_VALUE' }));
    });

    it('should return the token', () => {
      expect(instanceWrapper.getToken()).toBe(Provider);
    });

    it('should return the metatype', () => {
      expect(instanceWrapper.getMetatype()).toBe(Provider);
    });

    it('should return the dependencies', () => {
      expect(instanceWrapper.getDependencies()).toStrictEqual([{ token: 'DEPENDENCY', optional: false }]);
    });

    it('should return the instance', () => {
      const instance = instanceWrapper.getInstance();
      expect(instance).toBeInstanceOf(Provider);
    });

    it('should get the resolved status', async () => {
      const factoryProvider = new InstanceWrapper({ token: 'factory', useFactory: () => 'CONFIG_VALUE' });

      expect(factoryProvider.isResolved()).toBe(false);
      expect(instanceWrapper.isResolved()).toBe(false);
      expect(instanceWrapper.isResolved(createContextId())).toBe(false);
      instanceWrapper.setDependency(0, new InstanceWrapper({ token: 'DEPENDENCY', useValue: 'DEPENDENCY_VALUE' }));
      await instanceWrapper.loadInstance();
      expect(instanceWrapper.isResolved()).toBe(true);
    });

    it('should throw an error if the instance is not found', () => {
      expect(() => instanceWrapper.getInstance(createContextId())).toThrowError(InternalError);
    });

    it('should throw an error if the dependencies are not set', async () => {
      instanceWrapper['dependecies'].pop();
      await expect(() => instanceWrapper.loadInstance()).rejects.toThrowError(NeverError);
    });

    it('should load a transient prototype of the instance', () => {
      const contextId = createContextId();
      const prototype = instanceWrapper.loadPrototype(contextId);
      expect(prototype).toBeInstanceOf(Provider);
    });

    it('should clear the instance', () => {
      instanceWrapper.clearInstance();
      expect(instanceWrapper['instances']).toHaveProperty('size', 0);
    });

    it('should clear the instance for a specific context', async () => {
      const contextId = createContextId();
      await instanceWrapper.loadInstance();
      await instanceWrapper.loadInstance(contextId);
      instanceWrapper.clearInstance(contextId);
      expect(instanceWrapper['instances']).toHaveProperty('size', 1);
    });
  });
});
