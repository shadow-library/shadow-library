/**
 * Importing npm packages
 */
import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, OnModuleInit } from '@shadow-library/app';
import { type ValidateFunction } from 'ajv';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';

/**
 * Importing user defined packages
 */
import { MODULE_NAME, ajv } from '@shadow-library/database/constants';
import { type Config } from '@shadow-library/database/types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class ConfigService implements OnModuleInit {
  private configValidator: ValidateFunction;

  onModuleInit(): void {
    const configPath = join(__dirname, '..', '..', '..', 'schema', 'config.json');
    const configSchema = JSON.parse(readFileSync(configPath, 'utf-8'));
    delete configSchema.$schema;
    this.configValidator = ajv.compile(configSchema);
  }

  async loadConfig(rootDir?: string): Promise<Config> {
    const explorer = cosmiconfig(MODULE_NAME, { loaders: { '.ts': TypeScriptLoader() } });
    const result = await explorer.search(rootDir);
    if (!result) throw new Error('Config file not found');
    const valid = this.configValidator(result.config);
    if (!valid) throw new Error(`Invalid config: ${ajv.errorsText(this.configValidator.errors)}`);
    return result.config;
  }
}
