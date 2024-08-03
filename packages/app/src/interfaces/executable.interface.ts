/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { type Router } from './router.interface';
import { type ShadowApplication } from '../shadow-application';

/**
 * Defining types
 */

export interface Executable {
  execute(app: ShadowApplication, router?: Router): void | Promise<void>;
}
