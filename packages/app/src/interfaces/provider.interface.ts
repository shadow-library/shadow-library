/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type InjectionName = string | symbol | Class<unknown>;

export interface ClassProvider {
  name: InjectionName;
  useClass: Class<unknown>;
  useValue?: never;
  inject?: never;
  useFactory?: never;
}

export interface ValueProvider {
  name: InjectionName;
  useValue: any;
  useClass?: never;
  inject?: never;
  useFactory?: never;
}

export type FactoryProviderInject = InjectionName | { name: InjectionName; optional?: boolean };

export interface FactoryProvider {
  name: InjectionName;
  inject?: FactoryProviderInject[];
  useFactory: (...args: any[]) => any | Promise<any>;
  useClass?: never;
  useValue?: never;
}

export type Provider = Class<unknown> | ClassProvider | ValueProvider | FactoryProvider;
