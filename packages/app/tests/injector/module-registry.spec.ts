/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Controller, Injectable, Module, Route, forwardRef } from '@shadow-library/app';
import { HookTypes, ModuleRegistry } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ModuleRegistry', () => {
  let moduleRegistry: ModuleRegistry;

  @Injectable()
  class CatService {}

  @Injectable()
  class DogProvider {}

  @Controller()
  class CatController {
    constructor(public readonly catService: CatService) {}

    @Route()
    method() {}
  }

  @Controller()
  class DogController {
    constructor(public readonly dogProvider: DogProvider) {}

    @Route()
    method() {}
  }

  @Module({})
  class SheepModule {}

  @Module({ imports: [forwardRef(() => DogModule)], providers: [CatService], controllers: [CatController] })
  class CatModule {}

  @Module({ imports: [forwardRef(() => CatModule)], providers: [DogProvider], controllers: [DogController] })
  class DogModule {}

  @Module({ imports: [SheepModule, CatModule, DogModule] })
  class AnimalModule {}

  @Module({ imports: [AnimalModule] })
  class AppModule {}

  beforeEach(() => {
    jest.clearAllMocks();
    moduleRegistry = new ModuleRegistry(AppModule);
  });

  describe('object creation', () => {
    it('should throw an error if the module is not a module', () => {
      @Module({ imports: [class InvalidModule {}] })
      class AppModule {}

      expect(() => new ModuleRegistry(AppModule)).toThrow(InternalError);
    });

    it('should throw an error if the module import is undefined', () => {
      @Module({ imports: [undefined as any] })
      class InvalidModule {}
      expect(() => new ModuleRegistry(InvalidModule)).toThrow(InternalError);
    });

    it('should register all the modules in the correct order', () => {
      const modules = Array.from(moduleRegistry['modules'].values()).map(m => m.getMetatype());
      expect(modules).toStrictEqual([SheepModule, CatModule, DogModule, AnimalModule, AppModule]);
    });
  });

  describe('initiation and termination', () => {
    it('should initialize the modules', async () => {
      const mock = jest.fn() as any;
      const hook = jest.fn() as any;
      Array.from(moduleRegistry['modules'].values()).forEach(m => ((m.init = mock), (m.callHook = hook)));

      await moduleRegistry.init();

      expect(mock).toBeCalledTimes(5);
      expect(hook).toBeCalledTimes(10);
      new Array(5).forEach((_, index) => expect(hook).toHaveBeenNthCalledWith(index + 1, HookTypes.ON_MODULE_INIT));
      new Array(5).forEach((_, index) => expect(hook).toHaveBeenNthCalledWith(index + 6, HookTypes.ON_APPLICATION_READY));
    });

    it('should terminate the modules', async () => {
      const hook = jest.fn(async () => {});
      Array.from(moduleRegistry['modules'].values()).forEach(m => (m.callHook = hook));

      await moduleRegistry.terminate();

      expect(hook).toBeCalledTimes(10);
      new Array(5).forEach((_, index) => expect(hook).toHaveBeenNthCalledWith(index + 1, HookTypes.ON_APPLICATION_STOP));
      new Array(5).forEach((_, index) => expect(hook).toHaveBeenNthCalledWith(index + 6, HookTypes.ON_MODULE_DESTROY));
    });
  });

  describe('General', () => {
    beforeEach(() => moduleRegistry.init());

    it('should list all the modules', () => {
      const modules = moduleRegistry.get().map(m => m.getMetatype());
      expect(modules).toStrictEqual([SheepModule, CatModule, DogModule, AnimalModule, AppModule]);
    });

    it('should throw an error if the module is not found', () => {
      expect(() => moduleRegistry.get(class InvalidModule {})).toThrow(InternalError);
    });

    it('should get the module', () => {
      const module = moduleRegistry.get(DogModule);
      expect(module.getMetatype()).toBe(DogModule);
    });
  });
});
