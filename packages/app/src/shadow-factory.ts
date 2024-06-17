/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

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
  async create(module: Type): Promise<ShadowApplication> {
    const app = new ShadowApplication(module);
    return await app.init();
  }
}

export const ShadowFactory = new ShadowFactoryStatic();
