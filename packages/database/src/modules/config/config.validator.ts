/**
 * Importing npm packages
 */
import { Logger } from '@shadow-library/common';

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

    for (const collection of this.collectionData.values()) {
      const data = collection.getData();
      const relationErrors: Error[] = [];
      for (const relation of data.relations ?? []) {
        try {
          const targetCollection = this.collectionData.get(relation.collection);
          if (!targetCollection) throw new Error(`Collection not found: ${relation.collection}`);

          const type = collection.getFieldType(relation.localField);
          if (typeof type === 'string') targetCollection.validateForeignRelation(relation.foreignField, type);
          else throw new Error(`Invalid field type for relation: ${relation.localField}`);
        } catch (err: any) {
          relationErrors.push(err);
        }
      }
      errors.push(...relationErrors);
    }

    for (const error of errors) this.logger.error(error.message);
    if (errors.length) throw new Error('Database config validation failed');
  }
}
