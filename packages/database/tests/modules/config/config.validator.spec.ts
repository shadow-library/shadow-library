/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ConfigValidator } from '@shadow-library/database/modules/config/config.validator';
import { Collection } from '@shadow-library/database/types';

import userCollection from '../../schema/user.collection.json';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const collections: Collection[] = [
  {
    name: 'Schema1',
    schema: { profile: { type: 'object', subType: 'NotFound' } },
  },
  {
    name: 'Schema2',
    schema: {
      _id: { type: 'uniqueId', alias: 'id' } as any,
      id: { type: 'objectId' },
    },
  },
  {
    name: 'Schema3',
    schema: { auth: { type: 'object', subType: 'user-auth' } },
    subDocuments: [
      {
        name: 'user-auth',
        schema: {
          $discriminator: {
            key: 'type',
            values: {
              Password: { password: { type: 'string' } },
              OAuth: { token: { type: 'string' }, createdAt: { type: 'date' } },
            },
          },
          createdAt: { type: 'date' },
        },
      },
    ],
  },
  userCollection as any,
];

describe('ConfigValidator', () => {
  const config = { collections, formats: [] };

  it('should throw error if sub document not found', () => {
    const validator = new ConfigValidator(config);
    const collection = collections.find(c => c.name === 'Schema1')!;
    // @ts-expect-error: Testing private method
    expect(() => validator.validateCollection(collection)).toThrowError(`Sub document not found: NotFound`);
  });

  it('should throw error if duplicate key due to _id alias', () => {
    const validator = new ConfigValidator(config);
    const collection = collections.find(c => c.name === 'Schema2')!;
    // @ts-expect-error: Testing private method
    expect(() => validator.validateCollection(collection)).toThrowError(`Duplicate key 'id' in _id alias`);
  });

  it('should throw error if duplicate key found in discriminator', () => {
    const validator = new ConfigValidator(config);
    const collection = collections.find(c => c.name === 'Schema3')!;
    // @ts-expect-error: Testing private method
    expect(() => validator.validateCollection(collection)).toThrowError(`Duplicate key 'createdAt' in discriminator: 'OAuth'`);
  });

  it('should validate collection object', () => {
    const validator = new ConfigValidator(config);
    const collection = collections.find(c => c.name === 'User')!;
    // @ts-expect-error: Testing private method
    const result = validator.validateCollection(collection);
    expect(result).toBeUndefined();
  });
});
