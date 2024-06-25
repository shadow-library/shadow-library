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
const configPath = join(__dirname, '..');

describe('ConfigModule', () => {
  let module: ShadowApplication;
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
      collections: 'schema/**/*.collection.json',
      metadata: 'schema/metadata.json',
      outDir: 'dist/output',
    });
  });
});
