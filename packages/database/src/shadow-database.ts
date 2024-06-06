/**
 * Importing npm packages
 */
import { type MongoClientOptions } from 'mongodb';

/**
 * Importing user defined packages
 */
import { DatabaseClient } from './database-client';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class DatabaseFactory {
  private clients: DatabaseClient[] = [];

  connect(uri: string, options?: MongoClientOptions) {
    const client = new DatabaseClient(uri, options);
    this.clients.push(client);
    return client;
  }
}

const globalRef = global as any;
export const ShadowDatabase = globalRef.shadowDatabase || (globalRef.shadowDatabase = new DatabaseFactory());
