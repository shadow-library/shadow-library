/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Inject, Injectable, Module, Optional } from '@shadow-library/app';
import { ModuleState, Module as ModuleWrapper } from '@shadow-library/app/injector';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Module', () => {
  const testConfig = Symbol('CONFIG');

  @Injectable()
  class CatSubService {
    constructor(@Inject('CONFIG') public config: any) {}
  }

  @Injectable()
  class CatService {
    constructor(public catSubService: CatSubService) {}
  }

  @Injectable()
  class MockCatService {
    constructor(@Optional() @Inject(testConfig) public optionalData: any) {}
  }

  @Module({
    providers: [
      CatService,
      { name: 'CONFIG', useValue: 'CONFIG_VALUE' },
      { name: 'MOCK_CAT', useClass: MockCatService },
      { name: testConfig, useFactory: (config: string) => `TEST_${config}`, inject: ['CONFIG'] },
      CatSubService,
    ],
    exports: [CatService, 'MOCK_CAT'],
  })
  class CatModule {}

  const module = new ModuleWrapper(CatModule, []);

  it('should throw an error when a uninjectable class is provided', async () => {
    class InvalidCatService {}
    @Module({ providers: [InvalidCatService] })
    class InvalidCatModule {}
    const module = new ModuleWrapper(InvalidCatModule, []);
    const error = `Class 'InvalidCatService' is not an injectable provider`;
    await expect(module.init()).rejects.toThrowError(error);
  });

  it('should throw an error if the provider is not found', async () => {
    @Module({ providers: [CatService] })
    class InvalidCatModule {}
    const module = new ModuleWrapper(InvalidCatModule, []);
    const error = `Provider 'CatSubService' not found in module 'InvalidCatModule'`;
    await expect(module.init()).rejects.toThrowError(error);
  });

  it('should throw an error if the ordinary class is provided as the controller', async () => {
    class InvalidCatController {}
    @Module({ controllers: [InvalidCatController] })
    class InvalidCatModule {}
    const module = new ModuleWrapper(InvalidCatModule, []);
    const error = `Class 'InvalidCatController' is not a controller`;
    await expect(module.init()).rejects.toThrowError(error);
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
        { name: 'SERVICE_A', useClass: ServiceA },
        { name: 'SERVICE_B', useClass: ServiceB },
      ],
    })
    class CircularModule {}

    const module = new ModuleWrapper(CircularModule, []);
    const error = `Circular dependency detected: SERVICE_A -> SERVICE_B -> SERVICE_A`;
    await expect(module.init()).rejects.toThrowError(error);
  });

  it('should initialize the module', async () => {
    await expect(module.init()).resolves.toBeUndefined();
    expect(module.getState()).toBe(ModuleState.INITIALIZED);
  });

  it('should export the exported providers', () => {
    expect(module.getExportedProvider(CatService)).toBeInstanceOf(CatService);
    expect(module.getExportedProvider('MOCK_CAT')).toBeInstanceOf(MockCatService);
  });

  it('should return null if the provider is not exported', () => {
    expect(module.getExportedProvider(CatSubService)).toBeNull();
  });
});
