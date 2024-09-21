/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ServerError, ServerErrorCode } from '@shadow-library/server';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ServerError', () => {
  let error: ServerError;

  it('should create a new instance', () => {
    error = new ServerError(ServerErrorCode.S001);
    expect(error).toBeInstanceOf(ServerError);
  });

  it('should return the status code', () => {
    expect(error.getStatusCode()).toBe(500);
  });
});
