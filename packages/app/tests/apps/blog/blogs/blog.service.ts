/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { blogs } from '../data';
import { UserService } from '../user';

/**
 * Defining types
 */

export interface Blog {
  id: number;
  title: string;
  content: string;
  authorID: number;
}

/**
 * Declaring the constants
 */

@Injectable()
export class BlogService {
  private readonly blogs: Blog[] = [];

  constructor(private readonly userService: UserService) {
    this.blogs.push(...blogs);
  }

  createBlog(title: string, content: string, authorID: number): Blog {
    const author = this.userService.getUserByID(authorID);
    if (!author) throw new Error('Author not found');
    const blog: Blog = { id: 0, title, content, authorID };
    this.blogs.push(blog);
    return blog;
  }

  getBlogByID(id: number): Blog | null {
    const blog = this.blogs.find(blog => blog.id === id);
    return blog ?? null;
  }
}
