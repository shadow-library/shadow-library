/**
 * Importing npm packages
 */
import { Logger } from '@shadow-library/common';
import { ValidationError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { DatabaseConfig } from '@shadow-library/database/types';

import { CollectionSchema } from './collection.schema';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ConfigValidator {
  private readonly logger = Logger.getLogger(ConfigValidator.name);
  private readonly collectionData = new Map<string, CollectionSchema>();

  validate(config: DatabaseConfig): void {
    const errors: Error[] = [];
    for (const collection of config.collections) {
      try {
        if (this.collectionData.has(collection.name)) throw new Error(`Collection schema already exists: ${collection.name}`);
        const schema = new CollectionSchema(collection);
        schema.validate();
        this.collectionData.set(collection.name, schema);
      } catch (error: any) {
        errors.push(error);
      }
    }

    for (const error of errors) {
      let message = error.message;
      if (error instanceof ValidationError) message = error.getMessage();
      this.logger.error(message);
    }
    if (errors.length) throw new Error('Database config validation failed');
  }
}
