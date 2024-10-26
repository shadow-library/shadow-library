/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type TryResult<TError, TResult> = { success: true; data: TResult } | { success: false; error: TError };

/**
 * Declaring the constants
 */

export function throwError(error: Error): never {
  throw error;
}

export function tryCatch<TError extends Error, TResult>(fn: () => Promise<TResult>): Promise<TryResult<TError, TResult>>;
export function tryCatch<TError extends Error, TResult>(fn: () => TResult): TryResult<TError, TResult>;
export function tryCatch<TError extends Error, TResult>(fn: () => TResult | Promise<TResult>): TryResult<TError, TResult> | Promise<TryResult<TError, TResult>> {
  try {
    const data = fn();
    if (data instanceof Promise) return data.then(data => ({ success: true, data })).catch(error => ({ success: false, error })) as Promise<TryResult<TError, TResult>>;
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error };
  }
}

export function withThis<T, A extends any[], R>(fn: (context: T, ...args: A) => R) {
  return function (this: T, ...args: A): R {
    return fn(this, ...args);
  };
}
