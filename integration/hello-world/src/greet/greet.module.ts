/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { GreetController } from './greet.controller';
import { GreetService } from './greet.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  controllers: [GreetController],
  providers: [GreetService],
})
export class GreetModule {}
