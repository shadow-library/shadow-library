/**
 * Importing npm packages
 */
import { Ajv } from 'ajv';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const MODULE_NAME = 'shadow-database';

export const ajv = new Ajv({
  allErrors: true,
  strict: true,
  strictRequired: true,
  removeAdditional: 'all',
});
