/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { ApplicationConfig } from './interfaces';
import { ShadowApplication } from './shadow-application';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class ShadowFactoryStatic {
  async create(module: Type, options?: ApplicationConfig): Promise<ShadowApplication> {
    const app = new ShadowApplication(module, options);
    return await app.init();
  }
}

export const ShadowFactory = new ShadowFactoryStatic();
