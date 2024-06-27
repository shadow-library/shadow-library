/**
 * Importing npm packages
 */
import { fail } from 'assert';

import { describe, expect, it } from '@jest/globals';
import { ValidationError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { CollectionSchema } from '@shadow-library/database/modules/config/collection.schema';

import userCollection from '../../schema/user.collection.json';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('CollectionSchema', () => {
  it('should throw error if sub document not found', () => {
    const schema = new CollectionSchema({
      name: 'Schema1',
      schema: { profile: { type: 'object', subType: 'NotFound' } },
    });

    try {
      schema.validate();
      fail('Should throw error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.getErrors()).toStrictEqual([{ field: 'schema:profile', msg: 'Sub document not found: NotFound' }]);
    }
  });

  it('should throw error if duplicate key due to _id alias', () => {
    const schema = new CollectionSchema({
      name: 'Schema2',
      schema: {
        _id: { type: 'uniqueId', alias: 'id' } as any,
        id: { type: 'objectId' },
      },
    });

    try {
      schema.validate();
      fail('Should throw error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.getErrors()).toStrictEqual([{ field: 'schema:id', msg: `Duplicate key 'id' in _id alias` }]);
    }
  });

  it('should throw error if duplicate key found in discriminator', () => {
    const schema = new CollectionSchema({
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
    });

    try {
      schema.validate();
      fail('Should throw error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.getErrors()).toStrictEqual([{ field: 'schema:auth', msg: `Duplicate key 'createdAt' in discriminator: 'OAuth'` }]);
    }
  });

  it('should throw an error for invalid indexes', () => {
    const schema = new CollectionSchema({
      name: 'Schema4',
      schema: { username: { type: 'string' } },
      indexes: [{ name: 'invalid', keys: { email: 1 } }],
    });

    try {
      schema.validate();
      fail('Should throw error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.getErrors()).toStrictEqual([{ field: 'index:invalid', msg: `Unknown key 'email' in index` }]);
    }
  });

  it('should throw an error for invalid projections', () => {
    const schema = new CollectionSchema({
      name: 'Schema5',
      schema: { username: { type: 'string' } },
      projections: [{ name: 'user', project: { password: true } }],
    });

    try {
      schema.validate();
      fail('Should throw error');
    } catch (err: any) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.getErrors()).toStrictEqual([{ field: 'projection:user', msg: `Unknown keys: password` }]);
    }
  });

  it('should validate collection object', () => {
    const schema = new CollectionSchema(userCollection as any);
    expect(() => schema.validate()).not.toThrow();
  });
});
