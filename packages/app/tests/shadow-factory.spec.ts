/**
 * Importing npm packages
 */
import { describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ShadowApplication, ShadowFactory } from '@shadow-library/app';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
jest.mock('@shadow-library/app/shadow-application', () => ({
  ShadowApplication: jest.fn().mockImplementation(() => ({
    init: jest.fn(async () => {}).mockReturnThis(),
  })),
}));

describe('ShadowFactory', () => {
  describe('create', () => {
    it('should create and init the application', async () => {
      const router = jest.fn() as any;
      class AppModule {}

      const app = await ShadowFactory.create(AppModule, { router });

      expect(ShadowApplication).toBeCalledWith(AppModule, { router });
      expect(app.init).toBeCalledTimes(1);
    });
  });
});
