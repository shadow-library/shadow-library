/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Controller, Inject, Injectable, Module, OnApplicationReady, OnModuleDestroy, OnModuleInit, Optional, Route, forwardRef } from '@shadow-library/app';
import { HookTypes, ModuleRef, Module as ModuleWrapper } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Module', () => {
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

  @Injectable({ transient: true })
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

    isBound(): boolean {
      return true;
    }

    @Route()
    getCat(): boolean {
      return this.isBound();
    }
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

  beforeEach(() => {
    jest.resetAllMocks();
    module = new ModuleWrapper(CatModule);
  });

  describe('module creation', () => {
    it('should throw an error if the controller is not anotated', () => {
      class InvalidController {}
      @Module({ controllers: [InvalidController] })
      class InvalidModule {}

      expect(() => new ModuleWrapper(InvalidModule)).toThrow(InternalError);
    });

    it('should throw an error for duplicate providers', () => {
      @Module({ providers: [MockCatService, { token: MockCatService, useClass: CatSubService }] })
      class DuplicateModule {}

      expect(() => new ModuleWrapper(DuplicateModule)).toThrow(InternalError);
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

      expect(() => new ModuleWrapper(CircularModule)).toThrow(InternalError);
    });

    it('should add the module ref provider', () => {
      expect(module['providers'].get(ModuleRef)).toBeDefined();
    });

    it('should add the providers', () => {
      expect(module['providers'].get(CatService)).toBeDefined();
      expect(module['providers'].get('CONFIG')).toBeDefined();
      expect(module['providers'].get('MOCK_CAT')).toBeDefined();
      expect(module['providers'].get(testConfig)).toBeDefined();
      expect(module['providers'].get('NO_INJECT')).toBeDefined();
      expect(module['providers'].get(CatSubService)).toBeDefined();
    });

    it('should add the controllers', () => {
      const controllers = Array.from(module['controllers'].values());
      expect(controllers).toHaveLength(1);
      expect(controllers[0]?.getToken()).toBe(CatController);
    });

    it('should add the exports', () => {
      const exports = Array.from(module['exports']);
      expect(exports).toStrictEqual([CatService, 'MOCK_CAT']);
    });

    it('should load the module when there are no providers and controllers', () => {
      @Module({})
      class EmptyModule {}

      const emptyModule = new ModuleWrapper(EmptyModule);
      expect(emptyModule['providers'].size).toBe(1); // ModuleRef
      expect(emptyModule['controllers'].size).toBe(0);
    });
  });

  describe('General methods', () => {
    it('should get the module metatype', () => {
      expect(module.getMetatype()).toBe(CatModule);
    });

    it('should throw an error if the provider is not exported or not found', () => {
      expect(() => module.getProvider('NOT_FOUND')).toThrow(InternalError);
      expect(() => module.getProvider(CatSubService)).toThrow(InternalError);
    });

    it('should get the exported provider', () => {
      expect(module.getProvider(CatService)?.getToken()).toBe(CatService);
      expect(module.getProvider('MOCK_CAT')?.getToken()).toBe('MOCK_CAT');
    });

    it('should not throw an error if the provider is not exported and is optional', () => {
      expect(module.getProvider('NOT_FOUND', true)).toBeUndefined();
      expect(module.getProvider(CatSubService, true)).toBeUndefined();
    });

    it('should add the import', () => {
      @Module({})
      class NewModule {}

      const importModule = new ModuleWrapper(NewModule);
      module.addImport(importModule);

      expect(module['imports']).toHaveLength(1);
      expect(module['imports'][0]).toBe(importModule);
    });

    it('should return the init status', () => {
      expect(module.isInited()).toBe(false);
      module['instance'].isResolved = jest.fn(() => true);
      expect(module.isInited()).toBe(true);
    });
  });

  describe('Module Ref', () => {
    let moduleRef: ModuleRef;

    beforeEach(() => {
      moduleRef = module['getInternalProvider'](ModuleRef).getInstance() as any;
    });

    it('should throw an error if the provider is not found', () => {
      expect(() => moduleRef.get('NOT_FOUND')).toThrow(InternalError);
    });

    it('should throw error if provider is not exported from the imported module', () => {
      @Module({ imports: [CatModule] })
      class NewModule {}

      const newModule = new ModuleWrapper(NewModule).addImport(module);
      const moduleRef = newModule['getInternalProvider'](ModuleRef).getInstance() as any;

      expect(() => moduleRef.get(CatSubService)).toThrow(InternalError);
    });

    it('should get the provider', () => {
      expect(moduleRef.get('CONFIG')).toBe('CONFIG_VALUE');
      expect(moduleRef.get('MOCK_CAT')).toBeInstanceOf(MockCatService);
      expect(moduleRef.get(CatSubService)).toBeInstanceOf(CatSubService);
    });

    it('should throw an error if a non transient provider is resolved', async () => {
      await expect(moduleRef.resolve(CatSubService)).rejects.toThrow(InternalError);
    });

    it('should resolve the transient provider', async () => {
      const mock = jest.fn(async () => ({}) as any);
      module['providers'].get(CatService)!.loadInstance = mock;
      await moduleRef.resolve(CatService);
      expect(mock).toBeCalledTimes(1);
    });

    it('should resolve the provider exported from the imported module', async () => {
      const mock = jest.fn(async () => 'RESULT' as any);
      module['providers'].get(CatService)!.loadInstance = mock;

      @Module({ imports: [CatModule] })
      class NewModule {}

      const newModule = new ModuleWrapper(NewModule).addImport(module);
      const moduleRef = newModule['getInternalProvider'](ModuleRef).getInstance() as any;
      const instance = await moduleRef.resolve(CatService);

      expect(mock).toBeCalledTimes(1);
      expect(instance).toBe('RESULT');
    });
  });

  describe('Initialization and termination', () => {
    it('should initialize the module', async () => {
      await module.init();
      const isProvidersResolved = Array.from(module['providers'].values()).every(provider => provider.isResolved());
      const isControllersResolved = Array.from(module['controllers'].values()).every(controller => controller.isResolved());

      expect(module.isInited()).toBe(true);
      expect(isProvidersResolved).toBe(true);
      expect(isControllersResolved).toBe(true);
    });

    it('should initialize the module when optional provider is not provided', async () => {
      @Module({ providers: [MockCatService] })
      class OptionalModule {}
      const module = new ModuleWrapper(OptionalModule);

      await module.init();
      const isProvidersResolved = Array.from(module['providers'].values()).every(provider => provider.isResolved());
      const isControllersResolved = Array.from(module['controllers'].values()).every(controller => controller.isResolved());

      expect(module.isInited()).toBe(true);
      expect(isProvidersResolved).toBe(true);
      expect(isControllersResolved).toBe(true);
    });

    it('should throw an error if there is a circular dependency between transient providers', async () => {
      @Injectable({ transient: true })
      class CircularServiceA {
        constructor(@Inject(forwardRef(() => CircularServiceB)) public serviceB: object) {}
      }

      @Injectable({ transient: true })
      class CircularServiceB {
        constructor(@Inject(forwardRef(() => CircularServiceA)) public serviceA: CircularServiceA) {}
      }

      @Module({ providers: [CircularServiceA, CircularServiceB] })
      class CircularModule {}

      const module = new ModuleWrapper(CircularModule);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should throw an error if an unknown provider is exported', async () => {
      @Module({ exports: ['UNKNOWN_PROVIDER'] })
      class InvalidModule {}

      const module = new ModuleWrapper(InvalidModule);
      await expect(module.init()).rejects.toThrowError(InternalError);
    });

    it('should terminate the module', async () => {
      await module.init();
      await module.terminate();
      expect(onModuleDestroyMock).toBeCalledTimes(1);
    });
  });

  describe('Hooks', () => {
    beforeEach(() => module.init());

    it('should execute the hook for static instance', async () => {
      await module.callHook(HookTypes.ON_MODULE_INIT);
      expect(onModuleInitMock).toBeCalledTimes(2);
    });

    it('should execute the hook for all the instances of the transient provider', async () => {
      await module.callHook(HookTypes.ON_APPLICATION_READY);
      expect(onAppReadyMock).toBeCalledTimes(2);
    });
  });

  describe('Router', () => {
    const router = { register: jest.fn() };

    @Controller()
    class DogController {
      constructor(public catService: CatService) {}

      @Route()
      getDog() {}
    }

    @Module({ imports: [CatModule, forwardRef(() => AnimalModule)], controllers: [DogController] })
    class DogModule {}

    @Module({ imports: [DogModule] })
    class AnimalModule {}

    beforeEach(() => module.init());

    it('should do nothing if the router is not registered', async () => {
      jest.spyOn(module as any, 'getChildModules');
      await module.registerRoutes();

      expect(module['getChildModules']).not.toBeCalled();
    });

    it('should register the routes for all the controllers', async () => {
      const dogModule = new ModuleWrapper(DogModule);
      jest.spyOn(dogModule as any, 'getRouter').mockReturnValue(router);

      dogModule.addImport(module);
      await dogModule.init();
      await dogModule.registerRoutes();

      expect(router.register).toBeCalledTimes(1);
      expect(router.register).toBeCalledWith([
        {
          metadata: {},
          instance: expect.any(DogController),
          metatype: DogController,
          routes: [{ metadata: {}, handler: expect.any(Function), paramtypes: [], returnType: undefined }],
        },
        {
          metadata: {},
          instance: expect.any(CatController),
          metatype: CatController,
          routes: [{ metadata: {}, handler: expect.any(Function), paramtypes: [], returnType: Boolean }],
        },
      ]);
    });

    it('should bind the controller instance to the route handler', () => {
      const catController = Array.from(module['controllers'].values())[0]!;
      const routeController = module['getControllerRouteMetadata'](catController);
      const route = routeController.routes[0];

      expect(route?.handler()).toBe(true);
    });

    it('should register controllers only once for cyclic dependent modules', async () => {
      const dogModule = new ModuleWrapper(DogModule);
      const animalModule = new ModuleWrapper(AnimalModule);
      dogModule.addImport(animalModule).addImport(module);
      animalModule.addImport(dogModule);

      jest.spyOn(dogModule as any, 'getRouter').mockReturnValue(router);
      await dogModule.init();
      await dogModule.registerRoutes();

      expect(router.register.mock.lastCall?.[0]).toHaveLength(2);
    });

    it('should start the router', async () => {
      const router = { start: jest.fn() };
      jest.spyOn(module as any, 'getRouter').mockReturnValue(router);

      await module.start();

      expect(router.start).toBeCalledTimes(1);
    });

    it('should stop the router', async () => {
      const router = { stop: jest.fn() };
      jest.spyOn(module as any, 'getRouter').mockReturnValue(router);

      await module.stop();

      expect(router.stop).toBeCalledTimes(1);
    });
  });
});
