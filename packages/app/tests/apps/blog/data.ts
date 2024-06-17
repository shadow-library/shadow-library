/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { type Blog } from './blogs';

/**
 * Defining types
 */

interface UserData {
  id: number;
  name: string;
  email: string;
  session?: string;
}

/**
 * Declaring the constants
 */

export const users: UserData[] = [
  { id: 0, name: 'Admin', email: 'admin@shadow-apps.com', session: 'admin' },
  { id: 1, name: 'User One', email: 'user-1@shadow-apps.com' },
  { id: 2, name: 'User Two', email: 'user-2@shadow-apps.com', session: 'user-2' },
];

export const blogs: Blog[] = [
  { id: 0, title: 'First Blog', content: 'This is the content of the first blog.', authorID: 0 },
  { id: 1, title: 'Second Blog', content: 'This is the content of the second blog.', authorID: 1 },
  { id: 2, title: 'Third Blog', content: 'This is the content of the third blog.', authorID: 2 },
  { id: 3, title: 'Fourth Blog', content: 'This is the content of the fourth blog.', authorID: 0 },
  { id: 4, title: 'Fifth Blog', content: 'This is the content of the fifth blog.', authorID: 1 },
];
