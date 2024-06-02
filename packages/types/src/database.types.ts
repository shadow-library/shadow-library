/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type Projection<T extends object> = {
  [K in keyof T]?: T[K] extends object[] ? Projection<T[K][number]> | 1 : T[K] extends object ? Projection<T[K]> : 1;
};
