/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { objectUtils } from './object';
import { stringUtils } from './string';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class Utils {
  readonly object = objectUtils;
  readonly string = stringUtils;
}

export const utils = new Utils();
