/**
 * Importing npm packages
 */
import 'reflect-metadata';

/**
 * exporting modules
 */
export * from './decorators';
export { ModuleRef } from './injector';
export * from './interfaces';
export * from './utils';

export { PARAMTYPES_METADATA, RETURN_TYPE_METADATA } from './constants';
export * from './shadow-application';
export * from './shadow-factory';

export type { RouteController } from './injector';
