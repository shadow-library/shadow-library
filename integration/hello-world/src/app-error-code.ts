/**
 * Importing npm packages
 */

import { ErrorType } from '@shadow-library/common';
import { ServerErrorCode } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class AppErrorCode extends ServerErrorCode {
  static readonly A001 = new ServerErrorCode('A001', ErrorType.UNAUTHENTICATED, 'You are not authenticated');
  static readonly A002 = new ServerErrorCode('A002', ErrorType.UNAUTHORIZED, 'You are not authorized');
  static readonly A003 = new ServerErrorCode('A003', ErrorType.NOT_FOUND, 'User not found');
}
