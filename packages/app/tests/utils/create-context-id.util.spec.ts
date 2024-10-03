/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { createContextId } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('createContentId', () => {
  it('should return a random number', () => {
    const context = createContextId();
    expect(context).toMatchObject({ id: expect.any(Number) });
  });
});
