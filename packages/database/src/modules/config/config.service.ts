/**
 * Importing npm packages
 */
import { readFileSync } from 'fs';
import { join } from 'path';

import { Injectable, OnModuleInit } from '@shadow-library/app';
import { type ValidateFunction } from 'ajv';
import { cosmiconfig } from 'cosmiconfig';
import { TypeScriptLoader } from 'cosmiconfig-typescript-loader';
import { globSync } from 'glob';

/**
 * Importing user defined packages
 */
import { MODULE_NAME, ajv } from '@shadow-library/database/constants';
import { type Config, type DatabaseConfig } from '@shadow-library/database/types';

/**
 * Defining types
 */

type ValidationResult = { valid: true } | { valid: false; errors: string };

/**
 * Declaring the constants
 */

@Injectable()
export class ConfigService implements OnModuleInit {
  private readonly validators = new Map<string, ValidateFunction>();

  onModuleInit(): void {
    const filenames = ['config', 'collections', 'formats'];
    for (const filename of filenames) {
      const configPath = join(__dirname, '..', '..', '..', 'schema', `${filename}.json`);
      const configSchema = JSON.parse(readFileSync(configPath, 'utf-8'));
      delete configSchema.$schema;
      const validator = ajv.compile(configSchema);
      this.validators.set(filename, validator);
    }
  }

  private validate(schemaName: string, data: any): ValidationResult {
    const validator = this.validators.get(schemaName);
    if (!validator) throw new Error(`Validator not found for schema: ${schemaName}`);
    const valid = validator(data);
    if (!valid) return { valid: false, errors: ajv.errorsText(validator.errors) };
    return { valid: true };
  }

  async loadConfig(rootDir?: string): Promise<Config> {
    const explorer = cosmiconfig(MODULE_NAME, { loaders: { '.ts': TypeScriptLoader() } });
    const result = await explorer.search(rootDir);
    if (!result) throw new Error('Config file not found');

    const data = this.validate('config', result.config);
    if (!data.valid) throw new Error(`Invalid config: ${data.errors}`);
    return result.config;
  }

  async loadDatabaseConfig(collections: string[], formats?: string[]): Promise<DatabaseConfig> {
    const config: DatabaseConfig = { collections: [], formats: {} };
    const collectionFiles = collections.map(collection => globSync(collection)).flat();
    if (!collectionFiles.length) throw new Error('No collection files found');
    const formatFiles = formats?.map(format => globSync(format)).flat() || [];

    for (const collectionFile of collectionFiles) {
      const collection = JSON.parse(readFileSync(collectionFile, 'utf-8'));
      delete collection.$schema;
      const data = this.validate('collections', collection);
      if (!data.valid) throw new Error(`Invalid collection: ${data.errors}`);
      config.collections.push(collection);
    }

    for (const formatFile of formatFiles) {
      const format = JSON.parse(readFileSync(formatFile, 'utf-8'));
      delete format.$schema;
      const data = this.validate('formats', format);
      if (!data.valid) throw new Error(`Invalid format: ${data.errors}`);
      config.formats = { ...config.formats, ...format };
    }

    return config;
  }
}
