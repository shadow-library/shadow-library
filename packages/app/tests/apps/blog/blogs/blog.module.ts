/**
 * Importing npm packages
 */

import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { BlogService } from './blog.service';
import { UserModule } from '../user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [UserModule],
  providers: [BlogService],
  exports: [BlogService],
})
export class BlogModule {}
