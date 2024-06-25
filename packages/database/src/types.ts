/**
 * Importing npm packages
 */
import { MongoClient } from 'mongodb';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type NumberDataType = 'int' | 'long' | 'double';

export type StringDataType = 'uniqueId' | 'string' | 'objectId';

export type DataType = StringDataType | NumberDataType | 'boolean' | 'date' | 'object' | 'array';

interface BaseSchemaField {
  type: DataType;
  description?: string;
  required?: boolean | string;
  format?: string;
  validator?: string;
  transformer?: string;
  defaultFn?: string;
  immutable?: boolean;
}

export interface BooleanSchemaField extends BaseSchemaField {
  type: 'boolean';
  default?: boolean;
}

export interface StringSchemaField extends BaseSchemaField {
  type: 'string';
  default?: string;
  transform?: 'lowercase' | 'uppercase' | 'capitalize';
  trim?: boolean;
  enum?: string[] | Record<string, string>;
}

export interface NumberSchemaField extends BaseSchemaField {
  type: NumberDataType;
  default?: number;
  minimum?: number;
  maximum?: number;
  enum?: number[] | Record<string, number>;
}

export interface DateSchemaField extends BaseSchemaField {
  type: 'date';
  default?: string;
  minimum?: Date;
  maximum?: Date;
}

export interface ObjectSchemaField extends BaseSchemaField {
  type: 'object' | 'array';
  subType: string | Document;
}

export type SchemaField = BooleanSchemaField | StringSchemaField | NumberSchemaField | DateSchemaField | ObjectSchemaField;

export interface Discriminator {
  key: string;
  values: Record<string, Document>;
}

export interface Document {
  $discriminator?: Discriminator;
  [key: string]: SchemaField | Discriminator | undefined;
}

export interface SubDocument {
  name: string;
  description?: string;
  schema: Document;
}

export interface Index {
  name?: string;
  keys: Record<string, 1 | -1>;
  unique?: boolean;
  expireAfterSeconds?: number;
}

export interface Relation {
  collection: string;
  localField: string;
  foreignField: string;
}

export interface Project extends Record<string, boolean | Project> {}

export interface Projection {
  name: string;
  projection: Project;
}

export interface Collection {
  name: string;
  collectionName?: string;
  description?: string;
  schema: {
    _id?: { type: 'uniqueId' | 'objectId'; alias?: string };
  } & Document;
  subDocuments?: SubDocument[];
  indexes?: Index[];
  relations?: Relation[];
  projections?: Projection[];
}

export interface Format {
  name: string;
  pattern: string;
  description?: string;
}

export interface DatabaseMetadata {
  formats: Format[];
}

export interface Config {
  collections: string | string[];
  metadata?: string;
  outDir: string;
}

export interface DatabaseConfig {
  collections: Collection[];
  formats: Format[];
}

export interface DatabaseService {
  getMongoClient(): MongoClient | Promise<MongoClient>;
}
