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

export interface MixedDocument {
  $type: {
    name: string;
    type: string;
  }[];
  $key: string;
}

export type FixedDocument = Record<string, SchemaField>;

export type Document = FixedDocument | MixedDocument;

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

export interface Projection extends Record<string, boolean | Projection> {}

export interface Collection {
  name: string;
  alias?: string;
  description?: string;
  createdAt?: boolean;
  updatedAt?: boolean;
  schema: { _id?: { type: 'uniqueId' | 'objectId'; alias?: string } } & Document;
  indexes?: Index[];
  relations?: Relation[];
  projections?: Record<string, Projection>;
}

export interface ParsedCollection extends Collection {
  subDocuments: Record<string, Document>;
}

export interface CollectionGroup {
  name?: string;
  description?: string;
  definitions?: Record<string, Document>;
  collections: Collection[];
}

export interface Format {
  pattern: string;
  description?: string;
}

export type Formats = Record<string, Format>;

export type OutputConfig = { dirPath: string } | { filePath: string };

export interface Config {
  collections: string[];
  formats?: string[];
  output: string | OutputConfig;
}

export interface DatabaseConfig {
  collectionGroups: CollectionGroup[];
  formats: Formats;
}

export interface DatabaseService {
  getMongoClient(): MongoClient | Promise<MongoClient>;
}
