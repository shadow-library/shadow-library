/**
 * Importing npm packages
 */
import { rmSync, writeFileSync } from 'fs';
import { join } from 'path';

import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ConfigService } from '@shadow-library/database/modules/config';
import { ConfigValidator } from '@shadow-library/database/modules/config/config.validator';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const configPath = join(__dirname, '..', '..');
const configFilePath = join(configPath, '.shadow-databaserc.json');
const writeConfig = (config: any) => writeFileSync(configFilePath, JSON.stringify(config));
const deleteConfig = () => rmSync(configFilePath);

describe('ConfigService', () => {
  const validator = new ConfigValidator();
  const configService = new ConfigService(validator);
  const configs = new Map<string, any>();

  beforeAll(() => configService.onModuleInit());
  afterAll(() => deleteConfig());

  it('should throw error if config file not found', async () => {
    const error = new Error('Config file not found');
    // @ts-expect-error: Accessing private method
    await expect(configService.loadConfig()).rejects.toThrowError(error);
  });

  it('should throw an error if the config is invalid', async () => {
    writeConfig({ outDir: 'invalid.ts' });
    const error = new Error(`Invalid config: data must have required property 'collections'`);
    // @ts-expect-error: Accessing private method
    await expect(() => configService.loadConfig(configPath)).rejects.toThrowError(error);
    deleteConfig();
  });

  it('should return config', async () => {
    const basePath = 'packages/database/tests/schema';
    const actualConfig = { collections: `${basePath}/**/*.collection.json`, metadata: `${basePath}/metadata.json`, outDir: 'dist/output' };
    writeConfig({ $schema: '../schema/config.schema.json', ...actualConfig });
    // @ts-expect-error: Accessing private method
    const config = await configService.loadConfig(configPath);
    configs.set('config', config);
    expect(config).toMatchObject(actualConfig);
  });

  it('should throw error for no collections', async () => {
    const error = new Error('No collection files found');
    // @ts-expect-error: Accessing private method
    expect(() => configService.loadDatabaseSchemas({ collections: [], outDir: '' })).rejects.toThrowError(error);
  });

  it('should throw error for invalid collection', async () => {
    const collections = ['packages/database/tests/schema/dummy.invalid-collection.json'];
    // @ts-expect-error: Accessing private method
    expect(() => configService.loadDatabaseSchemas({ collections, outDir: '' })).rejects.toThrowError('Invalid collection: ');
  });

  it('should throw error for invalid metadata', async () => {
    const collections = ['packages/database/tests/schema/account.collection.json'];
    const metadata = 'packages/database/tests/schema/invalid-metadata.json';
    // @ts-expect-error: Accessing private method
    expect(() => configService.loadDatabaseSchemas({ collections, metadata, outDir: '' })).rejects.toThrowError('Invalid metadata: ');
  });

  it('should load the database config', async () => {
    const config = configs.get('config');
    // @ts-expect-error: Accessing private method
    const databaseConfig = await configService.loadDatabaseSchemas(config);

    const collections = databaseConfig.collections.map(c => c.name).sort();
    const formats = databaseConfig.formats.map(f => f.name).sort();
    expect(collections).toStrictEqual(['Account', 'Blog', 'Comment', 'User']);
    expect(formats).toStrictEqual(['email', 'person-name']);
  });

  it('should get the validated database config', async () => {
    const databaseConfig = await configService.getDatabaseConfigs(configPath);
    configs.set('databaseConfig', databaseConfig);

    const collections = databaseConfig.collections.map(c => c.name).sort();
    const formats = databaseConfig.formats.map(f => f.name).sort();
    expect(collections).toStrictEqual(['Account', 'Blog', 'Comment', 'User']);
    expect(formats).toStrictEqual(['email', 'person-name']);
  });

  it('should get the cached database config', async () => {
    const invalidPath = join(configPath, 'invalid');
    const databaseConfig = await configService.getDatabaseConfigs(invalidPath);
    expect(databaseConfig).toStrictEqual(configs.get('databaseConfig'));
  });
});
