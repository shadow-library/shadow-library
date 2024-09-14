/**
 * Importing npm packages
 */
import { InternalError, NeverError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { Injectable } from '@shadow-library/app';

import { UserSessionService } from './user-session.service';
import { users } from '../data';

/**
 * Defining types
 */

export interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Declaring the constants
 */

@Injectable()
export class UserService {
  constructor(private readonly userSessionService: UserSessionService) {}

  getUserByID(id: number): User | null {
    const user = users.find(user => user.id === id);
    return user ?? null;
  }

  getUserByEmail(email: string): User | null {
    const user = users.find(user => user.email === email);
    return user ?? null;
  }

  getUserFromSession(sessionId: string): User {
    const userId = this.userSessionService.getUserIdFromSession(sessionId);
    if (!userId) throw new InternalError('User not found');
    const user = this.getUserByID(userId);
    if (!user) throw new NeverError('Unexpected user not found');
    return user;
  }

  loginUser(email: string): string {
    const user = this.getUserByEmail(email);
    if (!user) throw new InternalError('User not found');
    const sessionId = `session-${user.id}`;
    this.userSessionService.setUserSession(sessionId, user.id);
    return sessionId;
  }
}
