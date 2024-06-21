/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type NumberDataType = 'int' | 'long' | 'double';

export type StringDataType = 'uniqueId' | 'string' | 'objectId';

export type DataType = StringDataType | NumberDataType | 'boolean' | 'date' | 'object' | 'array';

export interface SchemaField {
  type: DataType;
  description?: string;
  required?: boolean | string;
  format?: string;
  validator?: string;
  transformer?: string;
  defaultFn?: string;
}

export interface BooleanSchemaField extends SchemaField {
  type: 'boolean';
  default?: boolean;
}

export interface StringSchemaField extends SchemaField {
  type: 'string';
  default?: string;
  transform?: 'lowercase' | 'uppercase' | 'capitalize';
  trim?: boolean;
}

export interface NumberSchemaField extends SchemaField {
  type: NumberDataType;
  default?: number;
  minimum?: number;
  maximum?: number;
  enum?: number[];
}

export interface DateSchemaField extends SchemaField {
  type: 'date';
  default?: Date;
  minimum?: Date;
  maximum?: Date;
}

export interface ObjectSchemaField extends SchemaField {
  type: 'object' | 'array';
  subType: DataType | Document;
}

export type MixedDocument = { $type: string; $key: string };

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
  schema: { type: 'uniqueId' | 'objectId'; alias?: string } & Document;
  indexes?: Index[];
  relations?: Relation[];
  projections?: Record<string, Projection>;
}

export interface Collections {
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
