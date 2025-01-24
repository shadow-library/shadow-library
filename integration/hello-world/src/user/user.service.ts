/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';
import { ServerError } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { AppErrorCode } from '../app-error-code';

/**
 * Defining types
 */

export interface User {
  id: number;
  name: string;
  admin?: boolean;
}

/**
 * Declaring the constants
 */
const users = [
  { id: 1, name: 'Alice Smith', admin: true },
  { id: 2, name: 'Bob Johnson' },
  { id: 3, name: 'Charlie Brown' },
];

@Injectable()
export class UserService {
  async getUser(id: number | string): Promise<User | null>;
  async getUser(id: number | string, throwError: true): Promise<User>;
  async getUser(id: number | string, throwError?: true): Promise<User | null> {
    if (typeof id === 'string') id = parseInt(id, 10);
    await Bun.sleep(50);
    const user = users.find(user => user.id === id) ?? null;
    if (!user && throwError) throw new ServerError(AppErrorCode.A003);
    return user;
  }

  getUserByName(name: string): User | null {
    return users.find(user => user.name === name) ?? null;
  }

  async getUsers(): Promise<User[]> {
    await Bun.sleep(50);
    return users;
  }
}
