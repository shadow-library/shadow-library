/**
 * Importing npm packages
 */
import 'reflect-metadata';
import { ShadowFactory } from '@shadow-library/app';
import { Logger } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { AppModule } from './app.module';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

Logger.addDefaultTransports();
const app = await ShadowFactory.create(AppModule);
await app.start();
