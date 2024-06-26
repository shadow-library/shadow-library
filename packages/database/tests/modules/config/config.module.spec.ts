/**
 * Importing npm packages
 */
import { join } from 'path';

import { beforeAll, describe, expect, it } from '@jest/globals';
import { ShadowApplication, ShadowFactory } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { ConfigModule, ConfigService } from '@shadow-library/database/modules/config';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const configPath = join(__dirname, '..', '..');

describe('ConfigModule', () => {
  const configs = new Map<string, any>();
  let module: ShadowApplication;
  beforeAll(async () => (module = await ShadowFactory.create(ConfigModule)));

  it('should throw error if config file not found', async () => {
    const configService = module.get(ConfigService);
    const error = new Error('Config file not found');
    // @ts-expect-error: Accessing private method
    await expect(configService.loadConfig()).rejects.toThrowError(error);
  });

  it('should return config', async () => {
    const configService = module.get(ConfigService);
    // @ts-expect-error: Accessing private method
    const config = await configService.loadConfig(configPath);
    configs.set('config', config);
    expect(config).toMatchObject({
      collections: 'packages/database/tests/schema/**/*.collection.json',
      metadata: 'packages/database/tests/schema/metadata.json',
      outDir: 'dist/output',
    });
  });

  it('should load the database config', async () => {
    const configService = module.get(ConfigService);
    const config = configs.get('config');
    // @ts-expect-error: Accessing private method
    const databaseConfig = await configService.loadDatabaseSchemas(config);
    configs.set('databaseConfig', databaseConfig);

    const collections = databaseConfig.collections.map(c => c.name).sort();
    const formats = databaseConfig.formats.map(f => f.name).sort();
    expect(collections).toStrictEqual(['Account', 'Blog', 'Comment', 'User']);
    expect(formats).toStrictEqual(['email', 'person-name']);
  });

  it('should get the validated database config', async () => {
    const configService = module.get(ConfigService);
    const databaseConfig = await configService.getDatabaseConfigs(configPath);

    const collections = databaseConfig.collections.map(c => c.name).sort();
    const formats = databaseConfig.formats.map(f => f.name).sort();
    expect(collections).toStrictEqual(['Account', 'Blog', 'Comment', 'User']);
    expect(formats).toStrictEqual(['email', 'person-name']);
  });
});
