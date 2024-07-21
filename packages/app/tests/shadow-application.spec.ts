/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { Controller, Executable, GlobalModule, Inject, Injectable, Module, Route, Router, ShadowApplication } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const globalProvider = { name: 'CONFIG', useValue: 'CONFIG_VALUE' };
const router: Router = { registerRoute: jest.fn<() => void>() };

describe('Shadow Application', () => {
  const executableMock = jest.fn(() => {});

  @Injectable()
  class ProviderOne {
    constructor(@Inject(globalProvider.name) public config: string) {}
  }

  @Controller()
  class ControllerOne {
    @Route()
    method() {}
  }

  @Module({ providers: [ProviderOne], exports: [ProviderOne], controllers: [ControllerOne] })
  class DependencyOne {}

  @GlobalModule({ providers: [globalProvider], exports: [globalProvider.name] })
  class GlobalDependency {}

  @Module({ imports: [DependencyOne, GlobalDependency] })
  class AppModule implements Executable {
    execute = executableMock;
  }

  const application = new ShadowApplication(AppModule, { router });
  const debugMock = jest.fn().mockReturnThis();
  /** @ts-expect-error Accessing private member */
  application.logger.debug = debugMock;

  it('should throw an error if the module is not a module', () => {
    class InvalidModule {}
    const error = new InternalError(`Class '${InvalidModule.name}' is not a module`);
    expect(() => new ShadowApplication(InvalidModule)).toThrowError(error);
  });

  it('should throw error if there are more than one global modules', () => {
    @GlobalModule({})
    class GlobalModuleOne {}

    @GlobalModule({})
    class GlobalModuleTwo {}

    @Module({ imports: [GlobalModuleOne, GlobalModuleTwo] })
    class AppModule {}

    expect(() => new ShadowApplication(AppModule)).toThrowError('There can only be one global module');
  });

  it('should throw error if a global module is imported in a non-main module', () => {
    @GlobalModule({})
    class GlobalTestModule {}

    @Module({ imports: [GlobalTestModule] })
    class TestModule {}

    @Module({ imports: [TestModule] })
    class AppModule {}

    expect(() => new ShadowApplication(AppModule)).toThrowError(`Global module '${GlobalTestModule.name}' can only be imported in main module`);
  });

  it('should initialize the application', async () => {
    expect(application.isInited()).toBe(false);
    await application.init();
    expect(application.isInited()).toBe(true);
  });

  it('should only initialize the application once', async () => {
    debugMock.mockClear();
    await application.init();
    expect(debugMock).toBeCalledTimes(0);
  });

  it('should execute the main module', async () => {
    await application.start();
    expect(debugMock).toBeCalledTimes(0);
    expect(executableMock).toBeCalledTimes(1);
  });

  it('should get the provider instance', async () => {
    const provider = application.get(ProviderOne);
    expect(provider).toBeInstanceOf(ProviderOne);
  });

  it('should throw an error if the provider is not found', () => {
    class NotFound {}
    const error = new InternalError(`Provider '${NotFound.name}' not found or exported`);
    expect(() => application.get(NotFound)).toThrowError(error);
    expect(() => application.get('NotFound')).toThrowError(error);
  });

  it('should stop the application', async () => {
    await application.stop();
    const error = new InternalError(`Application not yet initialized`);
    expect(application.isInited()).toBe(false);
    expect(executableMock).toBeCalledTimes(1);
    expect(() => application.get(ProviderOne)).toThrowError(error);
  });

  it('should do nothing when stop() is called if the application is not initialized', async () => {
    debugMock.mockClear();
    await application.stop();
    expect(debugMock).toBeCalledTimes(0);
  });
});
