/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { ClassToken, InjectionToken } from '../interfaces';
import { ContextId } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export abstract class ModuleRef {
  /**
   * Retrieves an instance of a provider otherwise, throws exception.
   * @returns {TResult}
   */
  abstract get<TInput = any, TResult = TInput>(token: ClassToken<TInput>): TResult;
  abstract get<TInput = any, TResult = TInput>(token: InjectionToken): TResult;

  /**
   * Resolves transient instance of a provider otherwise, throws exception.
   * @returns {Array<TResult>}
   */
  abstract resolve<TInput = any, TResult = TInput>(typeOrToken: Class<TInput>, contextId?: ContextId): Promise<TResult>;
}
