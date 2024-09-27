/**
 * Importing npm packages
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Config, type ConfigRecords, ConfigService } from '@shadow-library/common';
import { Utils } from '@shadow-library/common/internal.utils';
import { throwError } from '@shadow-library/common/shorthands';

/**
 * Defining types
 */

interface CustomConfigRecords extends ConfigRecords {
  'custom.key': string;
  'optional.key'?: string;
  'transform.key': string;
  'number.key': number;
  'boolean.key': boolean;
  'enum.key': 'value1' | 'value2';
  'invalid.key': string;
}

/**
 * Declaring the constants
 */

describe('Config Service', () => {
  class CustomConfig extends ConfigService<CustomConfigRecords> {
    constructor() {
      super({ 'app.name': 'test-app' });
      this.set('optional.key');
      this.set('boolean.key', { defaultValue: 'true', validateType: 'boolean' });
      this.set('transform.key', { defaultValue: 'abc', transform: (value: string) => value.toUpperCase() });
    }
  }

  let config: CustomConfig;

  beforeEach(() => {
    Utils.exit = (err: string | Error) => throwError(err instanceof Error ? err : new Error(err));
    config = new CustomConfig();
  });

  describe('get', () => {
    it('should return the correct value for a given key', () => {
      expect(Config.isDev()).toBe(false);
      expect(Config.isProd()).toBe(false);
      expect(Config.isTest()).toBe(true);
      expect(config.get('boolean.key')).toBe(true);
      expect(config.get('app.name')).toBe('test-app');
      expect(config.get('transform.key')).toBe('ABC');
      expect(config.get('optional.key')).toBeUndefined();
    });

    it("should return the 'undefined' if the key is not found", () => {
      expect(config.get('random.key' as any)).toBeUndefined();
    });
  });

  describe('getOrThrow', () => {
    it('should throw an error if the key is not found', () => {
      expect(() => config.getOrThrow('random.key' as any)).toThrow();
    });

    it('should return the value if the key is found', () => {
      expect(config.getOrThrow('app.name')).toBe('test-app');
    });
  });

  describe('invalid initialization', () => {
    beforeAll(() => ((process.env.NODE_ENV = 'production'), void 0));
    afterAll(() => ((process.env.NODE_ENV = 'test'), void 0));

    it("should exit if 'custom.key' is not provided in production", () => {
      class CustomConfigService extends ConfigService<CustomConfigRecords> {
        constructor() {
          super();
          this.set('custom.key', { defaultValue: 'value', isProdRequired: true });
        }
      }
      expect(() => new CustomConfigService()).toThrow();
    });

    it('should exit if the environment variable is invalid number', () => {
      class CustomConfigService extends ConfigService<CustomConfigRecords> {
        constructor() {
          super();
          this.set('number.key', { defaultValue: 'abc', validateType: 'number' });
        }
      }
      expect(() => new CustomConfigService()).toThrow();
    });

    it('should exit if the environment variable is invalid boolean', () => {
      class CustomConfigService extends ConfigService<CustomConfigRecords> {
        constructor() {
          super();
          this.set('boolean.key', { defaultValue: 'abc', validateType: 'boolean' });
        }
      }
      expect(() => new CustomConfigService()).toThrow();
    });

    it('should exit if the environment variable is invalid enum value', () => {
      class CustomConfigService extends ConfigService<CustomConfigRecords> {
        constructor() {
          super();
          this.set('enum.key', { defaultValue: 'value3', allowedValues: ['value1', 'value2'] });
        }
      }
      expect(() => new CustomConfigService()).toThrow();
    });

    it('should exit if the environment variable is invalid', () => {
      class CustomConfigService extends ConfigService<CustomConfigRecords> {
        constructor() {
          super();
          this.set('invalid.key', { defaultValue: 'value', validator: value => value === 'invalid' });
        }
      }
      expect(() => new CustomConfigService()).toThrow();
    });
  });
});
