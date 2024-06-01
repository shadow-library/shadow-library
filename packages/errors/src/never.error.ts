/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

/**
 * An Error that should never happen. Use it to remove non null assertions
 */
export class NeverError extends Error {
  constructor(message?: string) {
    super(message);
    this.name = this.constructor.name;
  }
}
