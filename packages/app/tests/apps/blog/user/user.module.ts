/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { UserSessionService } from './user-session.service';
import { UserService } from './user.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  providers: [UserService, UserSessionService],
  exports: [UserService],
})
export class UserModule {}
