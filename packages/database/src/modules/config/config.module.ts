/**
 * Importing npm packages
 */
import { Module } from '@shadow-library/app';

/**
 * Importing user defined packages
 */
import { ConfigService } from './config.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Module({
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
