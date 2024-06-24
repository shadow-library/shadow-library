/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { CollectionGroup, Discriminator, Document, ObjectSchemaField, ParsedCollection, SchemaField } from '@shadow-library/database/types';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const baseTypes = ['boolean', 'int', 'long', 'double', 'uniqueId', 'string', 'objectId', 'date'];
const isObjectSchemaField = (field: SchemaField): field is ObjectSchemaField => field.type === 'object' || field.type === 'array';

@Injectable()
export class ParserService {
  private getDependentSubDocuments(schema: Document, definitions: Record<string, Document>, subDocuments: Record<string, Document>): Record<string, Document> {
    const keys = Object.keys(schema);
    for (const key in schema) {
      const subDocs: string[] = [];
      switch (key) {
        case '$descriminator': {
          const values = Object.values((schema.$discriminator as Discriminator).values);
          values.forEach(value => keys.push(...Object.keys(value)));
          break;
        }

        default: {
          const field = (schema as Record<string, SchemaField>)[key] as SchemaField;
          if (!isObjectSchemaField(field)) break;
          if (typeof field.subType === 'object') this.getDependentSubDocuments(field.subType, definitions, subDocuments);
          else if (baseTypes.includes(field.subType)) break;
          else subDocs.push(field.subType);
        }
      }

      for (const subDoc of subDocs) {
        if (subDoc in subDocuments) continue;
        const subDocument = definitions[subDoc];
        if (!subDocument) throw new InternalError(`Definition not found for: ${subDoc}`);
        subDocuments[subDoc] = subDocument;
        this.getDependentSubDocuments(subDocument, definitions, subDocuments);
      }
    }

    const duplicateKeys = keys.filter((key, index) => keys.indexOf(key) !== index);
    if (duplicateKeys.length > 0) throw new InternalError(`Duplicate document keys found: ${duplicateKeys.join(', ')}`);
    return subDocuments;
  }

  parseCollectionGroup(collectionGroup: CollectionGroup): ParsedCollection[] {
    const parsedCollections: ParsedCollection[] = [];
    const definitions = collectionGroup.definitions ?? {};
    for (const collection of collectionGroup.collections) {
      const subDocuments = this.getDependentSubDocuments(collection.schema, definitions, {});
      parsedCollections.push({ ...collection, subDocuments });
    }
    return parsedCollections;
  }
}
