/**
 * Importing npm packages
 */
import { Injectable } from '@shadow-library/app';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class GreetService {
  private getSalutation(gender?: string): string {
    if (gender === 'M') return 'Mr.';
    else if (gender === 'F') return 'Ms.';
    return '';
  }

  sayHello(name: string, gender?: string): string {
    const salutation = this.getSalutation(gender);
    return `Hello, ${salutation}${name}!`;
  }
}
