/**
 * Importing npm packages
 */
import { Ajv, type Options as AjvOptions } from 'ajv';
import addFormats from 'ajv-formats';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const ajvOptions: AjvOptions = {
  allErrors: true,
  strict: true,
  strictRequired: true,
};

export const MODULE_NAME = 'shadow-database';

export const ajv = addFormats(new Ajv(ajvOptions));
