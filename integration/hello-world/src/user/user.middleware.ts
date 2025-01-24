/**
 * Importing npm packages
 */
import { RouteMetdata } from '@shadow-library/app';
import { Middleware, MiddlewareGenerator, MiddlewareHandler, ServerError } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { AppErrorCode } from '../app-error-code';
import { UserService } from './user.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Middleware()
export class UserMiddleware implements MiddlewareGenerator {
  constructor(private readonly userService: UserService) {}

  generate(metadata: RouteMetdata): MiddlewareHandler | undefined {
    if (!metadata.auth) return;
    return async (request, response) => {
      response.header('Authenticated', 'true');

      const value = request.headers['authorization'];
      if (!value) throw new ServerError(AppErrorCode.A001);

      const user = await this.userService.getUser(value);
      if (!user) throw new ServerError(AppErrorCode.A001);
      if (metadata.admin && !user.admin) throw new ServerError(AppErrorCode.A002);
    };
  }
}
