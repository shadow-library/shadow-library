/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ShadowApplication } from './shadow-application';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowFactoryStatic {
  async create(module: Class<unknown>): Promise<ShadowApplication> {
    const app = new ShadowApplication(module);
    return await app.init();
  }
}

export const ShadowFactory = new ShadowFactoryStatic();
