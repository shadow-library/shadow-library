/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { BlogService } from '../blogs';
import { UserService } from '../user';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class CommentService {
  constructor(
    private readonly userService: UserService,
    private readonly blogService: BlogService,
  ) {}

  getCommentsByUserID(userID: number): string[] {
    const user = this.userService.getUserByID(userID);
    if (!user) return [];
    return [`Comment 1 by ${user.name}`, `Comment 2 by ${user.name}`];
  }
}
