/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface ForwardReference<T> {
  forwardRef: () => T;
}

/**
 * Declaring the constants
 */

export function forwardRef<T = any>(fn: () => T): ForwardReference<T> {
  return { forwardRef: fn };
}
