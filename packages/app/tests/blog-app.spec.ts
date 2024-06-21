/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

import { ShadowApplication, ShadowFactory } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { AppModule } from './apps/blog/app.module';
import { users } from './apps/blog/data';
import { UserService } from './apps/blog/user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Blog', () => {
  let app: ShadowApplication;

  it('should init the application', async () => {
    app = await ShadowFactory.create(AppModule);
    expect(app.isInited()).toBe(true);
    expect(app).toBeInstanceOf(ShadowApplication);
  });

  it('should return the inited and exported service', () => {
    const userService = app.get(UserService);
    expect(userService).toBeDefined();
    expect(userService).toBeInstanceOf(UserService);

    const user = userService.getUserByID(0);
    expect(user).toStrictEqual(users[0]);
  });
});
