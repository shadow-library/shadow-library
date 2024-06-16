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

export type InjectionToken = string | symbol | Type;

export interface ClassProvider {
  name: InjectionToken;
  useClass: Type;
  useValue?: never;
  inject?: never;
  useFactory?: never;
}

export interface ValueProvider {
  name: InjectionToken;
  useValue: any;
  useClass?: never;
  inject?: never;
  useFactory?: never;
}

export interface FactoryProvider {
  name: InjectionToken;
  inject?: (Type | { name: string; optional?: boolean })[];
  useFactory: (...args: any[]) => any;
  useClass?: never;
  useValue?: never;
}

export type Provider = Type | ClassProvider | ValueProvider | FactoryProvider;
