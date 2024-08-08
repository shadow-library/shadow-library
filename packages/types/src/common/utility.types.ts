/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type RequiredFields<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;
