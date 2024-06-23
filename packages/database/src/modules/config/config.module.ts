/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { ConfigService } from './config.service';
import { ParserService } from './parser.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  providers: [ConfigService, ParserService],
  exports: [ConfigService, ParserService],
})
export class ConfigModule {}
