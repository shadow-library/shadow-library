/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Collection, DatabaseConfig, Document, SchemaField } from '@shadow-library/database/types';

/**
 * Defining types
 */

type Field = string | { [key: string]: string | Field };

/**
 * Declaring the constants
 */
const baseTypes = ['boolean', 'int', 'long', 'double', 'uniqueId', 'string', 'objectId', 'date'];

export class ConfigValidator {
  private readonly collectionData = new Map<string, any>();

  constructor(private readonly config: DatabaseConfig) {}

  private getSubDocument(name: string, collection: Collection): Document {
    const subDocument = collection.subDocuments?.find(doc => doc.name === name);
    if (!subDocument) throw new Error(`Sub document not found: ${name}`);
    return subDocument.schema;
  }

  private validateCollectionObject(document: Document, collection: Collection): Record<string, Field> {
    const data: Field = {};
    for (const key in document) {
      if (key === '$discriminator') continue;
      const schema = (document as Record<string, SchemaField>)[key]!;
      data[key] = this.getSchemaType(schema, collection);
    }
    if (!document.$discriminator) return data;

    const discriminator: Field = {};
    const baseKeys = Object.keys(data);
    for (const value in document.$discriminator.values) {
      const subDocument = document.$discriminator.values[value]!;
      const object = this.validateCollectionObject(subDocument, collection);
      for (const k in object) if (baseKeys.includes(k)) throw new Error(`Duplicate key '${k}' in discriminator: '${value}'`);
      const key = `${document.$discriminator.key}$${value}`;
      discriminator[key] = { ...data, ...object };
    }
    return discriminator;
  }

  private getSchemaType(schema: SchemaField, collection: Collection): Field {
    if (baseTypes.includes(schema.type)) return schema.type;

    if (schema.type === 'array') {
      if (typeof schema.subType === 'string' && baseTypes.includes(schema.subType)) return schema.subType;
      if (typeof schema.subType === 'object') return this.validateCollectionObject(schema.subType, collection);
      const subDocument = this.getSubDocument(schema.subType, collection);
      return this.validateCollectionObject(subDocument, collection);
    }

    if (schema.type === 'object') {
      if (typeof schema.subType === 'object') return this.validateCollectionObject(schema.subType, collection);
      const subDocument = this.getSubDocument(schema.subType, collection);
      return this.validateCollectionObject(subDocument, collection);
    }

    throw new Error(`Invalid schema type: ${schema.type}`);
  }

  private validateCollection(collection: Collection): void {
    if (this.collectionData.has(collection.name)) return;

    const data: Field = {};
    for (const key in collection.schema) {
      const schema = collection.schema[key] as SchemaField;
      let [fieldKey, type] = [key, schema.type as Field];

      if (key === '_id' && 'alias' in schema) [fieldKey, type] = [schema.alias as string, schema.type];
      else type = this.getSchemaType(schema, collection);

      if (fieldKey in data) throw new Error(`Duplicate key '${fieldKey}' in _id alias`);
      data[fieldKey] = type;
    }

    this.collectionData.set(collection.name, data);
  }

  validate(): void {
    for (const collection of this.config.collections) this.validateCollection(collection);
  }
}
