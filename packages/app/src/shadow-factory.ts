/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { Router } from './interfaces';
import { ShadowApplication } from './shadow-application';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowFactoryStatic {
  async create(module: Type, router?: Router): Promise<ShadowApplication> {
    const app = new ShadowApplication(module, router);
    return await app.init();
  }
}

export const ShadowFactory = new ShadowFactoryStatic();
