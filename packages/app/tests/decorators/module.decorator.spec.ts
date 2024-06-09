/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Module } from '@shadow-library/app';

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
    const imports = Reflect.getMetadata('imports', TestModule);
    const providers = Reflect.getMetadata('providers', TestModule);
    const exports = Reflect.getMetadata('exports', TestModule);
    const controllers = Reflect.getMetadata('controllers', TestModule);

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
