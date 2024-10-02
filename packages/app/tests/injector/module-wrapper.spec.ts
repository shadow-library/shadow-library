/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError, NeverError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Controller, Inject, Injectable, Module, type OnApplicationReady, OnModuleDestroy, OnModuleInit, Optional } from '@shadow-library/app';
import { ControllerWrapper, LifecycleMethods, ModuleWrapper } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ModuleWrapper', () => {
  const testConfig = Symbol('CONFIG');
  const onModuleInitMock = jest.fn(() => {});
  const onAppReadyMock = jest.fn(() => {});
  const onModuleDestroyMock = jest.fn(() => {});
  let module: ModuleWrapper;

  @Injectable()
  class CatSubService implements OnModuleInit {
    constructor(@Inject('CONFIG') public config: any) {}
    onModuleInit = onModuleInitMock;
  }

  @Injectable()
  class CatService implements OnApplicationReady {
    constructor(public catSubService: CatSubService) {}
    onApplicationReady = onAppReadyMock;
  }

  @Injectable()
  class MockCatService implements OnModuleInit {
    constructor(@Optional() @Inject(testConfig) public optionalData: any) {}
    onModuleInit = onModuleInitMock;
  }

  @Controller()
  class CatController {
    constructor(public catService: CatService) {}
  }

  @Module({
    providers: [
      CatService,
      { token: 'CONFIG', useValue: 'CONFIG_VALUE' },
      { token: 'MOCK_CAT', useClass: MockCatService },
      { token: testConfig, useFactory: (config: string) => `TEST_${config}`, inject: ['CONFIG'] },
      { token: 'NO_INJECT', useFactory: (config: string) => `NO_INJECT_${config}` },
      CatSubService,
    ],
    controllers: [CatController],
    exports: [CatService, 'MOCK_CAT'],
  })
  class CatModule implements OnModuleDestroy {
    constructor(public catService: CatService) {}
    onModuleDestroy = onModuleDestroyMock;
  }

  describe('module initialization', () => {
    beforeEach(() => {
      jest.resetAllMocks();
      module = new ModuleWrapper(CatModule, []);
    });

    it('should throw an error when a uninjectable class is provided', async () => {
      class InvalidCatService {}
      @Module({ providers: [InvalidCatService] })
      class InvalidCatModule {}
      const module = new ModuleWrapper(InvalidCatModule, []);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should throw an error if the provider is not found', async () => {
      @Module({ providers: [CatService] })
      class InvalidCatModule {}
      const module = new ModuleWrapper(InvalidCatModule, []);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should throw an error if the ordinary class is provided as the controller', async () => {
      class InvalidCatController {}
      @Module({ controllers: [InvalidCatController] })
      class InvalidCatModule {}
      const module = new ModuleWrapper(InvalidCatModule, []);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should throw error when method is called before module initialization', async () => {
      const module = new ModuleWrapper(CatModule, []);

      expect(() => module.getControllers()).toThrowError(NeverError);
      await expect(module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_READY)).rejects.toThrowError(NeverError);
    });

    it('should detect circular dependencies', async () => {
      @Injectable()
      class ServiceA {
        constructor(@Inject('SERVICE_B') public serviceB: any) {}
      }

      @Injectable()
      class ServiceB {
        constructor(@Inject('SERVICE_A') public serviceA: any) {}
      }

      @Module({
        providers: [
          { token: 'SERVICE_A', useClass: ServiceA },
          { token: 'SERVICE_B', useClass: ServiceB },
        ],
      })
      class CircularModule {}

      const module = new ModuleWrapper(CircularModule, []);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should initialize the module', async () => {
      await expect(module.init()).resolves.toBe(module);
      expect(onModuleInitMock).toBeCalledTimes(2);
      expect(module.isInited()).toBe(true);
      expect(module.getInstance()).toBeInstanceOf(CatModule);
    });

    it('should initialize the module when optional provider is not provided', async () => {
      @Module({ providers: [MockCatService] })
      class OptionalModule {}

      const module = new ModuleWrapper(OptionalModule, []);
      await expect(module.init()).resolves.toBe(module);
      expect(module.isInited()).toBe(true);
      expect(module.getInstance()).toBeInstanceOf(OptionalModule);
    });
  });

  describe('lifecycle methods', () => {
    beforeEach(async () => {
      jest.resetAllMocks();
      module = new ModuleWrapper(CatModule, []);
      await module.init();
    });

    it('should run lifecycle methods', async () => {
      await module.runLifecycleMethod(LifecycleMethods.ON_APPLICATION_READY);
      expect(onAppReadyMock).toBeCalledTimes(1);
    });
  });

  describe('module component exports', () => {
    beforeEach(async () => {
      jest.resetAllMocks();
      module = new ModuleWrapper(CatModule, []);
      await module.init();
    });

    it('should export the exported providers', () => {
      expect(module.getExportedProvider(CatService)).toBeInstanceOf(CatService);
      expect(module.getExportedProvider('MOCK_CAT')).toBeInstanceOf(MockCatService);
    });

    it('should return undefined if the provider is not exported', () => {
      expect(module.getExportedProvider(CatSubService)).toBeUndefined();
    });

    it('should return the controllers', () => {
      const controllers = module.getControllers();
      expect(controllers).toHaveLength(1);
      expect(controllers[0]).toBeInstanceOf(ControllerWrapper);
    });
  });

  describe('module destruction', () => {
    beforeEach(async () => {
      jest.resetAllMocks();
      module = new ModuleWrapper(CatModule, []);
      await module.init();
    });

    it('should destroy the module', async () => {
      await module.destroy();

      expect(module.isInited()).toBe(false);
      expect(onModuleDestroyMock).toBeCalledTimes(1);
      expect(() => module.getInstance()).toThrowError(NeverError);
      expect(() => module.getExportedProvider('MOCK_CAT')).toThrowError(NeverError);
    });

    it('should do nothing when destorying uninited module', async () => {
      await module.destroy();

      module.runLifecycleMethod = jest.fn<(a: any) => any>();
      await module.destroy();

      expect(module.runLifecycleMethod).not.toBeCalled();
    });
  });
});
