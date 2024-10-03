/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ClassProvider, FactoryProvider, ValueProvider } from '@shadow-library/app';
import { isClassProvider, isFactoryProvider, isValueProvider } from '@shadow-library/app/injector/helpers';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Provider Classifier', () => {
  describe('isValueProvider', () => {
    it('should return true if the provider is a value provider', () => {
      const provider: ValueProvider = { token: 'test', useValue: 'test' };
      expect(isValueProvider(provider)).toBe(true);
    });

    it('should return false if the provider is a class provider', () => {
      class Class {}
      const provider: ClassProvider = { token: Class, useClass: Class };
      expect(isValueProvider(provider)).toBe(false);
      expect(isValueProvider(Class)).toBe(false);
    });

    it('should return false if the provider is a factory provider', () => {
      const provider: FactoryProvider = { token: 'test', useFactory: () => 'test' };
      expect(isValueProvider(provider)).toBe(false);
    });
  });

  describe('isFactoryProvider', () => {
    it('should return true if the provider is a factory provider', () => {
      const provider: FactoryProvider = { token: 'test', useFactory: () => 'test' };
      expect(isFactoryProvider(provider)).toBe(true);
    });

    it('should return false if the provider is a class provider', () => {
      class Class {}
      const provider: ClassProvider = { token: Class, useClass: Class };
      expect(isFactoryProvider(provider)).toBe(false);
      expect(isFactoryProvider(Class)).toBe(false);
    });

    it('should return false if the provider is a value provider', () => {
      const provider: ValueProvider = { token: 'test', useValue: 'test' };
      expect(isFactoryProvider(provider)).toBe(false);
    });
  });

  describe('isClassProvider', () => {
    it('should return true if the provider is a class provider', () => {
      class Class {}
      const provider: ClassProvider = { token: Class, useClass: Class };
      expect(isClassProvider(provider)).toBe(true);
    });

    it('should return false if the providers is a class', () => {
      class Class {}
      expect(isClassProvider(Class)).toBe(false);
    });

    it('should return false if the provider is a factory provider', () => {
      const provider: FactoryProvider = { token: 'test', useFactory: () => 'test' };
      expect(isClassProvider(provider)).toBe(false);
    });

    it('should return false if the provider is a value provider', () => {
      const provider: ValueProvider = { token: 'test', useValue: 'test' };
      expect(isClassProvider(provider)).toBe(false);
    });
  });
});
