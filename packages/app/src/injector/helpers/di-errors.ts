/**
 * Importing npm packages
 */
import { InternalError, NeverError } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { InjectionToken } from '../../interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class DIErrorsStatic {
  unexpected(message: string): never {
    message += `\n\nThis is most likely a bug. Please, report it to the Shadow Library team.`;
    throw new NeverError(message);
  }

  circularDependency(circularDeps: InjectionToken[][], transient = false): never {
    const paths = circularDeps.map(deps => deps.map(dep => dep.toString()));
    let message = `A circular dependency has been detected at the following path:\n\n`;
    message += paths.map(path => `  ${path.join(' -> ')}\n`);
    if (transient) message += `\n\nThis is a transient dependency, which means it is not safe to resolve it. Refactor your providers to avoid this circular dependency`;
    else message += `\n\nPlease, make sure that each side of a bidirectional relationships are decorated with "forwardRef()".`;
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

  notFound(token: InjectionToken, module: Class<unknown>): never {
    const tokenName = (token as any).name ?? token.toString();
    let message = `Provider '${tokenName}' not found or exported in module '${module.name}'.`;
    message += ` Make sure that it is part of the providers array of the current module.`;
    throw new InternalError(message);
  }
}

export const DIErrors = new DIErrorsStatic();
