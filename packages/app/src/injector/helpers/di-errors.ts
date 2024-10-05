/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { InjectionToken } from '../../interfaces';

/**
 * Defining types
 */

export interface InjectorDependencyContext {
  token?: InjectionToken;

  /**
   * The index of the dependency which gets injected
   * from the dependencies array
   */
  index?: number;
  /**
   * The dependency array which gets injected
   */
  dependencies?: InjectionToken[];
}

/**
 * Declaring the constants
 */

export class DIErrorsStatic {
  circularDependency(paths: string[][]): never {
    let message = `A circular dependency has been detected at the following path:\n\n`;
    message += paths.map(path => `  ${path.join(' -> ')}\n`);
    message += `\n\nPlease, make sure that each side of a bidirectional relationships are decorated with "forwardRef()".`;
    message += `\nNote that circular relationships between custom providers (e.g., factories) are not supported since functions cannot be called more than once.`;
    throw new InternalError(message);
  }

  undefinedDependency(parent: InjectionToken, index: number): never {
    parent = parent.toString();
    let message = `Cannot resolve dependencies of ${parent}.`;
    message += ` The dependency at index ${index} cannot be resolved.`;
    message += `This might be due to circular dependency. Use forwardRef() to avoid it.`;
    throw new InternalError(message);
  }

  unknownExport(token: InjectionToken, module: Class<unknown>): never {
    token = token.toString();
    let message = `You cannot export a provider that is not a part of the currently processed module (${module.name}).`;
    message += `Please verify whether the exported ${token} is available in this particular context.`;
    throw new InternalError(message);
  }
}

export const DIErrors = new DIErrorsStatic();
