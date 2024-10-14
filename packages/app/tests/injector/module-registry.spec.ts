/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Controller, Executable, Injectable, Module, Route, forwardRef } from '@shadow-library/app';
import { ModuleRegistry } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ModuleRegistry', () => {
  const executable = jest.fn(() => {});
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
  class AppModule implements Executable {
    execute = executable;
  }

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

  describe('initiation', () => {
    it('should initialize the modules', async () => {
      const mock = jest.fn() as any;
      Array.from(moduleRegistry['modules'].values()).forEach(m => (m.init = mock));

      await moduleRegistry.init();

      expect(mock).toBeCalledTimes(5);
    });
  });
});
