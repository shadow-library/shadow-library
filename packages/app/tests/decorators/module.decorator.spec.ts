/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Module } from '@shadow-library/app';
import { MODULE_METADATA } from '@shadow-library/app/constants';

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
    const metadata = Reflect.getMetadata(MODULE_METADATA, TestModule);
    expect(metadata).toBe(moduleProps);
  });
});
