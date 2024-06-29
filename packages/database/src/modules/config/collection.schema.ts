/**
 * Importing npm packages
 */
import { ValidationError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { Collection, Document, Index, Projection, SchemaField } from '@shadow-library/database/types';

/**
 * Defining types
 */

export type Field = string | { [key: string]: string | Field };

/**
 * Declaring the constants
 */
const baseTypes = ['boolean', 'int', 'long', 'double', 'uniqueId', 'string', 'objectId', 'date'];
const getDotNotationKeys = (obj: Record<string, any>, prefix = ''): string[] => {
  const keys = [];
  for (const key in obj) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    keys.push(newKey);
    if (typeof obj[key] === 'object') {
      const innerKeys = getDotNotationKeys(obj[key], newKey);
      keys.push(...innerKeys);
    }
  }
  return keys;
};

export class CollectionSchema {
  private readonly object: Record<string, Field> = { _id: 'objectId' };

  constructor(private readonly collection: Collection) {
    const id = collection.schema._id;
    if (id) this.object._id = id.type;
    const defaultIndexes: Index[] = [{ keys: { _id: 1 }, unique: true }];
    const alias = collection.schema._id?.alias;
    if (alias) defaultIndexes.push({ keys: { [alias]: 1 }, unique: true });
    collection.indexes = collection.indexes ? [...collection.indexes, ...defaultIndexes] : defaultIndexes;
  }

  private getSubDocument(name: string): Document {
    const subDocuments = this.collection.subDocuments ?? [];
    const subDocument = subDocuments.find(doc => doc.name === name);
    if (!subDocument) throw new Error(`Sub document not found: ${name}`);
    return subDocument.schema;
  }

  private getSchemaType(schema: SchemaField): Field {
    if (baseTypes.includes(schema.type)) return schema.type;

    if (schema.type === 'array') {
      if (typeof schema.subType === 'string' && baseTypes.includes(schema.subType)) return schema.subType;
      if (typeof schema.subType === 'object') return this.validateCollectionObject(schema.subType);
      const subDocument = this.getSubDocument(schema.subType);
      return this.validateCollectionObject(subDocument);
    }

    if (schema.type === 'object') {
      if (typeof schema.subType === 'object') return this.validateCollectionObject(schema.subType);
      const subDocument = this.getSubDocument(schema.subType);
      return this.validateCollectionObject(subDocument);
    }

    throw new Error(`Invalid schema type: ${schema.type}`);
  }

  private validateCollectionObject(document: Document): Record<string, Field> {
    const data: Field = {};
    for (const key in document) {
      if (key === '$discriminator') continue;
      const schema = (document as Record<string, SchemaField>)[key]!;
      data[key] = this.getSchemaType(schema);
    }
    if (!document.$discriminator) return data;

    const discriminator: Field = {};
    const baseKeys = Object.keys(data);
    for (const value in document.$discriminator.values) {
      const subDocument = document.$discriminator.values[value]!;
      const object = this.validateCollectionObject(subDocument);
      for (const k in object) if (baseKeys.includes(k)) throw new Error(`Duplicate key '${k}' in discriminator: '${value}'`);
      const key = `${document.$discriminator.key}$${value}`;
      discriminator[key] = { ...data, ...object };
    }
    return discriminator;
  }

  private validateProjection(projection: Projection) {
    const errorFields: string[] = [];
    const objectKeys = getDotNotationKeys(this.getObject());
    const projectKeys = getDotNotationKeys(projection.project);
    projectKeys.forEach(key => (objectKeys.includes(key) ? void 0 : errorFields.push(key)));
    if (errorFields.length > 0) throw new Error(`Unknown keys: ${errorFields.join(', ')}`);
  }

  private validateIndex(index: Index) {
    for (const key in index.keys) {
      const field = this.getFieldType(key);
      if (!field) throw new Error(`Unknown key '${key}' in index`);
    }
  }

  getFieldType(key: string): Field | null {
    const accessor = key.split('.');
    let obj = this.object;
    for (const k of accessor) {
      obj = obj[k] as Record<string, Field>;
      if (!obj) return null;
    }
    return obj;
  }

  getData(): Collection {
    return this.collection;
  }

  getObject(): Record<string, Field> {
    if (Object.keys(this.object).length === 0) this.validate();
    return this.object;
  }

  validateForeignRelation(key: string, type: string): void {
    if (key !== '_id') {
      const indexes = this.collection.indexes ?? [];
      const indexKeys = indexes
        .map(index => getDotNotationKeys(index.keys))
        .filter(keys => keys.length === 1)
        .flat();
      if (!indexKeys.includes(key)) throw new Error(`Key '${key}' not found or indexed in collection, hence can't be used in relation`);
    }

    const fieldType = this.getFieldType(key);
    if (fieldType !== type) throw new Error(`TypeMismatch: The type of the fields should be same`);
  }

  validate(): void {
    const validatorError = new ValidationError();
    const schema = this.collection.schema;
    for (const key in schema) {
      const schemaField = schema[key] as SchemaField;
      let [fieldKey, type] = [key, schemaField.type as Field];

      try {
        if (key === '_id' && 'alias' in schemaField) [fieldKey, type] = [schemaField.alias as string, schemaField.type];
        else type = this.getSchemaType(schemaField);

        if (fieldKey in this.object) throw new Error(`Duplicate key '${fieldKey}' in schema`);
        this.object[fieldKey] = type;
      } catch (err: any) {
        validatorError.addFieldError(`schema:${key}`, err.message);
      }
    }

    const indexes = this.collection.indexes ?? [];
    for (const index of indexes) {
      try {
        this.validateIndex(index);
      } catch (err: any) {
        const name = index.name ?? Object.keys(index.keys).join('_');
        validatorError.addFieldError(`index:${name}`, err.message);
      }
    }

    const projections = this.collection.projections ?? [];
    for (const projection of projections) {
      try {
        this.validateProjection(projection);
      } catch (err: any) {
        validatorError.addFieldError(`projection:${projection.name}`, err.message);
      }
    }

    const relations = this.collection.relations ?? [];
    const allowedRelationFieldTypes = ['uniqueId', 'objectId', 'int', 'long', 'double', 'string', 'date'];
    for (const relation of relations) {
      const fieldType = this.getFieldType(relation.localField);
      if (!fieldType) validatorError.addFieldError(`relation:${relation.collection}`, `Key '${relation.localField}' not found in schema`);

      let valid = true;
      if (typeof fieldType === 'object') valid = false;
      else if (!allowedRelationFieldTypes.includes(fieldType)) valid = false;
      if (!valid) validatorError.addFieldError(`relation:${relation.collection}`, `type should be one of ${allowedRelationFieldTypes.join(', ')}`);
    }

    if (validatorError.getErrorCount() > 0) throw validatorError;
  }
}
