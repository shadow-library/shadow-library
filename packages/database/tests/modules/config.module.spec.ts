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

  it('should return config', async () => {
    const configService = module.get(ConfigService);
    const config = await configService.loadConfig(configPath);
    expect(config).toStrictEqual({
      collections: ['scchema/**/*.database.json'],
      formats: ['schema/custom-formats.json'],
      output: 'database.ts',
    });
  });
});
