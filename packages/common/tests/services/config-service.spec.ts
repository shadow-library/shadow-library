/**
 * Importing npm packages
 */
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { type ConfigRecords, ConfigService } from '@shadow-library/common';
import { Utils } from '@shadow-library/common/internal.utils';

/**
 * Defining types
 */

interface CustomConfigRecords extends ConfigRecords {
  'custom.key': string;
}

/**
 * Declaring the constants
 */
const setNodeEnv = (env: string): void => {
  process.env.NODE_ENV = env;
};
const throwError = (err: string | Error) => {
  if (typeof err === 'string') err = new Error(err);
  throw err;
};

class CustomConfigService extends ConfigService<CustomConfigRecords> {
  constructor() {
    super({ 'app.name': 'custom-test-app' });
    this.set('custom.key', { defaultValue: 'value', isProdRequired: true });
  }
}

describe('Config Service', () => {
  let config: ConfigService<ConfigRecords>;

  beforeAll(() => {
    Utils.exit = throwError;
    config = new ConfigService<ConfigRecords>({ 'app.name': 'test-app' });
  });

  describe('get', () => {
    it('should return the correct value for a given key', () => {
      expect(config.get('app.name')).toBe('test-app');
    });

    it("should return the 'undefined' if the key is not found", () => {
      expect(config.get('random.key' as any)).toBeUndefined();
    });
  });

  describe('getOrThrow', () => {
    it('should throw an error if the key is not found', () => {
      expect(() => config.getOrThrow('random.key' as any)).toThrow();
    });
  });

  describe('invalid initialization', () => {
    beforeAll(() => setNodeEnv('production'));
    afterAll(() => setNodeEnv('test'));

    it("should throw an error if 'custom.key' is not provided in production", () => {
      expect(() => new CustomConfigService()).toThrow();
    });
  });
});
