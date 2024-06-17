/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { users } from '../data';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class UserSessionService {
  private readonly sessions = new Map<string, number>();

  constructor() {
    const usersWithSession = users.filter(user => user.session);
    usersWithSession.forEach(user => this.sessions.set(user.session!, user.id));
  }

  getUserIdFromSession(sessionId: string): number | undefined {
    return this.sessions.get(sessionId);
  }

  setUserSession(sessionId: string, userId: number): void {
    this.sessions.set(sessionId, userId);
  }
}
