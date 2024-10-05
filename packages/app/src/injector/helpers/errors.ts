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

export const errors = {
  getCircularDependencyError(paths: string[][]): InternalError {
    let message = `A circular dependency has been detected at the following path:\n\n`;
    message += paths.map(path => `  ${path.join(' -> ')}\n`);
    message += `\n\nPlease, make sure that each side of a bidirectional relationships are decorated with "forwardRef()".`;
    message += `\nNote that circular relationships between custom providers (e.g., factories) are not supported since functions cannot be called more than once.`;
    return new InternalError(message);
  },
} satisfies Record<string, (...args: any) => InternalError>;
