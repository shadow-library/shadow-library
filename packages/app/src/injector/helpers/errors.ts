/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export function getCircularDependencyError(paths: string[]): Error {
  const message = `A circular dependency has been detected at the following path: \n\n  ${paths.join(' -> ')}\n\nPlease, make sure that each side of a bidirectional relationships are decorated with "forwardRef()". Note that circular relationships between custom providers (e.g., factories) are not supported since functions cannot be called more than once.`;
  return new InternalError(message);
}

export const errors = { getCircularDependencyError };
