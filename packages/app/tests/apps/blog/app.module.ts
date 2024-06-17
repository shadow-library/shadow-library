/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { BlogModule } from './blogs';
import { CommentModule } from './comments';
import { UserModule } from './user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [BlogModule, CommentModule, UserModule],
})
export class AppModule {}
