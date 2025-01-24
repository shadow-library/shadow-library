/**
 * Importing npm packages
 */
import { FastifyModule } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { GreetModule } from './greet/greet.module';
import { UserModule } from './user/user.module';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const AppModule = FastifyModule.forRoot({
  imports: [GreetModule, UserModule],
});
