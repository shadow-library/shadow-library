/**
 * Importing npm packages
 */

import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ConfigValidator } from '@shadow-library/database/modules/config/config.validator';
import { DatabaseConfig } from '@shadow-library/database/types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ConfigValidator', () => {
  const configValidator = new ConfigValidator();

  it('should throw error for duplicate collection name', () => {
    const config: DatabaseConfig = {
      collections: [
        { name: 'User', schema: {} },
        { name: 'User', schema: {} },
      ],
      formats: [],
    };

    const error = new Error('Database config validation failed');
    expect(() => configValidator.validate(config)).toThrowError(error);
  });

  it('should throw error if the foreign collection is not found', () => {
    const config: DatabaseConfig = {
      collections: [{ name: 'User', schema: {}, relations: [{ collection: 'Comment', localField: '_id', foreignField: '_id' }] }],
      formats: [],
    };

    const error = new Error('Database config validation failed');
    expect(() => configValidator.validate(config)).toThrowError(error);
  });

  it('should throw error if the local field type is invalid', () => {
    const config: DatabaseConfig = {
      collections: [
        { name: 'User', schema: { username: { type: 'array', subType: 'string' } }, relations: [{ collection: 'Account', localField: 'username', foreignField: '_id' }] },
        { name: 'Account', schema: {} },
      ],
      formats: [],
    };

    const error = new Error('Database config validation failed');
    expect(() => configValidator.validate(config)).toThrowError(error);
  });
});
