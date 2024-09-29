/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { GlobalModule } from '@shadow-library/app';
import { GLOBAL_WATERMARK, MODULE_METADATA, MODULE_WATERMARK } from '@shadow-library/app/constants';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('@GlobalModule', () => {
  it('should throw exception when global module properties are invalid', () => {
    const propsOne = { providers: ['Test'], imports: ['Test'] };
    const propsTwo = { providers: ['Test'], controllers: ['Test'] };

    expect(GlobalModule.bind(null, propsOne as any)).toThrowError(InternalError);
    expect(GlobalModule.bind(null, propsTwo as any)).toThrowError(InternalError);
  });

  it('should enhance class with expected global module metadata', () => {
    const props = { providers: ['Test'], exports: ['Test'] };
    @GlobalModule(props as any)
    class TestGlobalModule {}

    const isModule = Reflect.getMetadata(MODULE_WATERMARK, TestGlobalModule);
    const isGlobalModule = Reflect.getMetadata(GLOBAL_WATERMARK, TestGlobalModule);
    const exports = Reflect.getMetadata(MODULE_METADATA.EXPORTS, TestGlobalModule);
    const providers = Reflect.getMetadata(MODULE_METADATA.PROVIDERS, TestGlobalModule);

    expect(isModule).toBe(true);
    expect(isGlobalModule).toBe(true);
    expect(exports).toStrictEqual(props.exports);
    expect(providers).toStrictEqual(props.providers);
  });
});
