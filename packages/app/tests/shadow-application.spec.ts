/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { Executable, Injectable, Module, ShadowApplication } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Shadow Application', () => {
  const executableMock = jest.fn(() => {});

  @Injectable()
  class AppProvider {}

  @Module({
    providers: [AppProvider],
    exports: [AppProvider],
  })
  class AppModule implements Executable {
    execute = executableMock;
  }

  const application = new ShadowApplication(AppModule);
  const debugMock = jest.fn().mockReturnThis();
  /** @ts-expect-error Accessing private member */
  application.logger.debug = debugMock;

  it('should throw an error if the module is not a module', () => {
    class InvalidModule {}
    const error = new InternalError(`Class '${InvalidModule.name}' is not a module`);
    expect(() => new ShadowApplication(InvalidModule)).toThrowError(error);
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
    const provider = application.get(AppProvider);
    expect(provider).toBeInstanceOf(AppProvider);
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
    expect(() => application.get(AppProvider)).toThrowError(error);
  });

  it('should do nothing when stop() is called if the application is not initialized', async () => {
    debugMock.mockClear();
    await application.stop();
    expect(debugMock).toBeCalledTimes(0);
  });
});
