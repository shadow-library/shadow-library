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

  it('should serialize the error', () => {
    const payload = error.serialize();
    expect(payload).toBe('{"code":"S001","type":"SERVER_ERROR","message":"Unexpected Server Error"}');
  });
});
