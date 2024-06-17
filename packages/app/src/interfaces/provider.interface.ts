/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type InjectionName = string | symbol | Type;

export interface ClassProvider {
  name: InjectionName;
  useClass: Type;
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

export type Provider = Type | ClassProvider | ValueProvider | FactoryProvider;
