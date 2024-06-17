/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { CommentService } from './comment.service';
import { BlogModule } from '../blogs/blog.module';
import { UserModule } from '../user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  imports: [UserModule, BlogModule],
  providers: [CommentService],
  exports: [],
})
export class CommentModule {}
