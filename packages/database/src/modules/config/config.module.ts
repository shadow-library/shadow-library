/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { ConfigService } from './config.service';
import { ConfigValidator } from './config.validator';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  providers: [ConfigService, ConfigValidator],
  exports: [ConfigService],
})
export class ConfigModule {}
