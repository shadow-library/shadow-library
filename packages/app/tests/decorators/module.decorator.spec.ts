/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Module } from '@shadow-library/app';
import { MODULE_METADATA, MODULE_WATERMARK } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@Module', () => {
  const moduleProps = { providers: ['Test'], imports: ['Test'], exports: ['Test'], controllers: ['Test'] };

  @Module(moduleProps as any)
  class TestModule {}

  it('should enhance class with expected module metadata', () => {
    const isModule = Reflect.getMetadata(MODULE_WATERMARK, TestModule);
    const imports = Reflect.getMetadata(MODULE_METADATA.IMPORTS, TestModule);
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, TestModule);
    const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, TestModule);
    const controllers = Reflect.getMetadata(MODULE_METADATA.CONTROLLERS, TestModule);

    expect(isModule).toBe(true);
    expect(imports).toStrictEqual(moduleProps.imports);
    expect(providers).toStrictEqual(moduleProps.providers);
    expect(controllers).toStrictEqual(moduleProps.controllers);
    expect(exports).toStrictEqual(moduleProps.exports);
  });

  it('should throw exception when module properties are invalid', () => {
    const invalidProps = { ...moduleProps, test: [] };

    expect(Module.bind(null, invalidProps as any)).toThrowError();
  });
});
