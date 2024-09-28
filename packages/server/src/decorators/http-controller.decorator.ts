/**
 * Importing npm packages
 */
import { Controller } from '@shadow-library/app';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function HttpController(path?: string): ClassDecorator {
  return target => Controller({ basePath: path ?? '' })(target);
}
