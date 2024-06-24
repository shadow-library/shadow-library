/**
 * Importing npm packages
 */
import { join } from 'path';

import { beforeAll, describe, expect, it } from '@jest/globals';
import { ShadowApplication, ShadowFactory } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { ConfigModule, ConfigService, ParserService } from '@shadow-library/database/modules/config';
import { CollectionGroup, type DatabaseConfig } from '@shadow-library/database/types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const configPath = join(__dirname, '..');

describe('ConfigModule', () => {
  let module: ShadowApplication;
  let config: DatabaseConfig;
  beforeAll(async () => (module = await ShadowFactory.create(ConfigModule)));

  it('should throw error if config file not found', async () => {
    const configService = module.get(ConfigService);
    const error = new Error('Config file not found');
    await expect(configService.loadConfig()).rejects.toThrowError(error);
  });

  it('should return config', async () => {
    const configService = module.get(ConfigService);
    const config = await configService.loadConfig(configPath);
    expect(config).toMatchObject({
      collections: ['scchema/**/*.database.json'],
      formats: ['schema/custom-formats.json'],
      output: 'database.ts',
    });
  });

  it('should load the database config and validate it', async () => {
    const configService = module.get(ConfigService);
    const collections = join(__dirname, '..', '**', '*.database.json');
    const formats = join(__dirname, '..', '**', 'custom-formats.json');
    config = await configService.loadDatabaseConfig([collections], [formats]);
    expect(config.collectionGroups).toHaveLength(1);
    expect(config.collectionGroups[0]?.name).toBe('test-database-collections');
    expect(config.formats).toStrictEqual({
      email: { description: 'Email address', pattern: expect.any(String) },
      'person-name': { description: 'Person name', pattern: expect.any(String) },
    });
  });

  it('should parse the collection groups', () => {
    const parserService = module.get(ParserService);
    const parsedCollectionGroups = parserService.parseCollectionGroup(config.collectionGroups[0]!);
    const subDocuments = parsedCollectionGroups.map(p => Object.keys(p.subDocuments));
    const userSubDocuments = ['UserEmail', 'UserProfile', 'UserAuth', 'UserSession'];
    expect(subDocuments).toStrictEqual([[], userSubDocuments, [], []]);
  });

  it('should parse the collection groups for circular schemas', () => {
    const parserService = module.get(ParserService);
    const collectionGroup: CollectionGroup = {
      definitions: {
        SchemaA: { normalPropA: { type: 'string' }, circular: { type: 'object', subType: 'SchemaB' } },
        SchemaB: { normalPropB: { type: 'string' }, circular: { type: 'object', subType: 'SchemaA' } },
      },
      collections: [{ name: 'circular', schema: { baseProp: { type: 'string' }, circular: { type: 'object', subType: 'SchemaA' } } }],
    };
    const parsedCollectionGroups = parserService.parseCollectionGroup(collectionGroup);
    const subDocuments = parsedCollectionGroups.map(p => Object.keys(p.subDocuments));
    expect(subDocuments).toStrictEqual([['SchemaA', 'SchemaB']]);
  });
});
