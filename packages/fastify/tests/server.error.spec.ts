/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ServerError, ServerErrorCode } from '@shadow-library/fastify';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ServerError', () => {
  it('should return the custom status code', () => {
    const error = new ServerError(ServerErrorCode.S004);
    expect(error.getStatusCode()).toBe(413);
  });

  it('should return the default status code', () => {
    const error = new ServerError(ServerErrorCode.S002);
    expect(error.getStatusCode()).toBe(404);
  });
});
