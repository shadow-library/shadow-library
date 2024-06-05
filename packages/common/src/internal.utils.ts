/**
 * Importing npm packages
 */
import { red } from '@colors/colors';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class InternalUtils {
  public exit(message: string): void {
    console.error(red(message)); // eslint-disable-line no-console
    process.exit(1);
  }
}

const globalRef = global as any;
export const Utils: InternalUtils = globalRef.internalUtils || (globalRef.internalUtils = new InternalUtils());
