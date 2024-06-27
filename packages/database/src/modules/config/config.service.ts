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

import { ConfigValidator } from './config.validator';

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
  private databaseConfig: DatabaseConfig | null = null;

  constructor(private readonly configValidator: ConfigValidator) {}

  onModuleInit(): void {
    const filenames = ['config', 'collection', 'database-metadata'];
    for (const filename of filenames) {
      const configPath = join(__dirname, '..', '..', '..', 'schema', `${filename}.schema.json`);
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

  private async loadConfig(rootDir?: string): Promise<Config> {
    const explorer = cosmiconfig(MODULE_NAME, { loaders: { '.ts': TypeScriptLoader() } });
    const result = await explorer.search(rootDir);
    if (!result) throw new Error('Config file not found');

    const data = this.validate('config', result.config);
    if (!data.valid) throw new Error(`Invalid config: ${data.errors}`);
    return result.config;
  }

  private async loadDatabaseSchemas(config: Config): Promise<DatabaseConfig> {
    const dbConfig: DatabaseConfig = { collections: [], formats: [] };
    const collectionPaths = typeof config.collections === 'string' ? [config.collections] : config.collections;
    const collectionFiles = collectionPaths.map(collection => globSync(collection)).flat();
    if (!collectionFiles.length) throw new Error('No collection files found');

    for (const collectionFile of collectionFiles) {
      const collection = JSON.parse(readFileSync(collectionFile, 'utf-8'));
      delete collection.$schema;
      const data = this.validate('collection', collection);
      if (!data.valid) throw new Error(`Invalid collection: ${data.errors}`);
      dbConfig.collections.push(collection);
    }

    if (config.metadata) {
      const metadataFile = readFileSync(config.metadata, 'utf-8');
      const metadata = JSON.parse(metadataFile);
      delete metadata.$schema;
      const data = this.validate('database-metadata', metadata);
      if (!data.valid) throw new Error(`Invalid metadata: ${data.errors}`);
      dbConfig.formats = metadata.formats;
    }

    return dbConfig;
  }

  async getDatabaseConfigs(rootDir?: string): Promise<DatabaseConfig> {
    if (this.databaseConfig) return this.databaseConfig;
    const config = await this.loadConfig(rootDir);
    const databaseConfig = await this.loadDatabaseSchemas(config);
    this.configValidator.validate(databaseConfig);
    return databaseConfig;
  }
}
