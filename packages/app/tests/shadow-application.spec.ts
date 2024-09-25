/**
 * Importing npm packages
 */
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

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

describe('ShadowApplication', () => {
  const ROUTER_KEY = Symbol('router');
  const globalProvider = { name: 'CONFIG', useValue: 'CONFIG_VALUE' };
  const router: Router = { register: jest.fn<() => void>(), identifier: ROUTER_KEY };
  const executable = jest.fn(() => {});
  const logger = { debug: jest.fn() };

  afterEach(() => {
    jest.clearAllMocks();
  });

  @Injectable()
  class ProviderOne {
    constructor(@Inject(globalProvider.name) public config: string) {}
  }

  @Controller()
  class ControllerOne {
    @Route({ [ROUTER_KEY]: true, key: ROUTER_KEY })
    method() {}
  }

  @Module({ providers: [ProviderOne], exports: [ProviderOne], controllers: [ControllerOne] })
  class DependencyOne {}

  @GlobalModule({ providers: [globalProvider], exports: [globalProvider.name] })
  class GlobalDependency {}

  @Module({ imports: [DependencyOne, GlobalDependency] })
  class AppModule implements Executable {
    execute = executable;
  }

  describe('object creation', () => {
    it('should throw an error if the module is not a module', () => {
      class InvalidModule {}
      const error = new InternalError(`Class '${InvalidModule.name}' is not a module`);
      expect(() => new ShadowApplication(InvalidModule)).toThrowError(error);
    });

    it('should throw error if there are more than one global modules', () => {
      @GlobalModule()
      class GlobalModuleOne {}

      @GlobalModule()
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
  });

  describe('application initialization', () => {
    it('should initialize the application', async () => {
      const application = new ShadowApplication(AppModule, { router });
      expect(application.isInited()).toBe(false);

      await application.init();
      expect(application.isInited()).toBe(true);
    });

    it('should initialize the application with router array', async () => {
      const application = new ShadowApplication(AppModule, { router: [router] });
      application['logger'].debug = logger.debug;
      await application.init();

      expect(router.register).toBeCalledTimes(1);
      expect(logger.debug).toBeCalledTimes(3);
      expect(logger.debug).toBeCalledWith(expect.stringContaining('Registering routes for router'));
    });

    it('should return the instance if the application is already initialized', async () => {
      const application = new ShadowApplication(AppModule, { router });
      await application.init();

      application['logger'].debug = logger.debug;
      await application.init();

      expect(logger.debug).not.toBeCalled();
    });

    it('should not register the routes if there are no routers', async () => {
      const application = new ShadowApplication(AppModule);
      application['logger'].debug = logger.debug;
      await application.init();

      expect(logger.debug).not.toBeCalledWith(expect.stringContaining('Registering routes for router'));
    });
  });

  describe('application execution', () => {
    let application: ShadowApplication;

    beforeEach(async () => {
      application = new ShadowApplication(AppModule, { router });
      application.init = jest.fn(application.init);
    });

    it('should init the application if not inited', async () => {
      await application.start();
      expect(application.init).toBeCalled();
    });

    it('should execute the main module', async () => {
      await application.start();
      expect(application.init).toBeCalled();
      expect(executable).toBeCalled();
    });

    it('should not execute the main module if it is not executable', async () => {
      application['main'].getInstance = jest.fn(() => ({ execute: 'one' }));
      await expect(application.start()).resolves.toBe(application);
    });
  });

  describe('application termination', () => {
    let application: ShadowApplication;

    beforeEach(async () => {
      application = new ShadowApplication(AppModule, { router });
    });

    it('should stop the application', async () => {
      await application.start();

      application['logger'].debug = logger.debug;
      application['modules'].clear = jest.fn(application['modules'].clear);
      await application.stop();

      expect(application.isInited()).toBe(false);
      expect(application['modules'].clear).toBeCalled();
      expect(logger.debug).toBeCalledWith('Application stopped');
    });

    it('should do nothing if the application is not initialized', async () => {
      application['logger'].debug = logger.debug;
      await application.stop();

      expect(logger.debug).not.toBeCalled();
    });
  });

  describe('application providers', () => {
    let application: ShadowApplication;

    beforeEach(async () => {
      application = new ShadowApplication(AppModule, { router });
      await application.start();
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

    it('should throw an error if the application is not initialized', () => {
      application.isInited = jest.fn(() => false);
      const error = new InternalError(`Application not yet initialized`);
      expect(() => application.get(ProviderOne)).toThrowError(error);
    });
  });
});
