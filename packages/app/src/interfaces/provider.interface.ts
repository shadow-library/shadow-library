/**
 * Importing npm packages
 */
import { AbstractClass, Class } from 'type-fest';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */
export type ClassToken<T = unknown> = Class<T> | AbstractClass<T>;

export type InjectionToken = string | symbol | ClassToken;

export type FactoryDependency = {
  token: InjectionToken;
  optional: boolean;
};

export type Provider<T = any> = Class<T> | ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>;

export interface ClassProvider<T = any> {
  /**
   * Injection token
   */
  token: InjectionToken;

  /**
   * Type (class name) of provider (instance to be injected).
   */
  useClass: Class<T>;

  /**
   * This option is only available on value providers!
   */
  useValue?: never;

  /**
   * This option is only available on factory providers!
   */
  inject?: never;

  /**
   * This option is only available on factory providers!
   */
  useFactory?: never;
}

export interface ValueProvider<T = any> {
  /**
   * Injection token
   */
  token: InjectionToken;

  /**
   * Instance of a provider to be injected.
   */
  useValue: T;

  /**
   * This option is only available on class providers!
   */
  useClass?: never;

  /**
   * This option is only available on factory providers!
   */
  inject?: never;

  /**
   * This option is only available on factory providers!
   */
  useFactory?: never;
}

export interface FactoryProvider<T = any> {
  /**
   * Injection token
   */
  token: InjectionToken;

  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: Array<InjectionToken | FactoryDependency>;

  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory: (...args: any[]) => T | Promise<T>;

  /**
   * This option is only available on class providers!
   */
  useClass?: never;

  /**
   * This option is only available on value providers!
   */
  useValue?: never;
}
