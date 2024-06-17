/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { SELF_DECLARED_DEPS_METADATA } from '../constants';
import { InjectionName } from '../interfaces';

/**
 * Defining types
 */

export interface InjectMetadata {
  name: InjectionName;
  index: number;
}

/**
 * Declaring the constants
 */

export function Inject(name: InjectionName): ParameterDecorator {
  return (target, _key, index) => {
    let dependencies = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, target) ?? [];
    dependencies = [...dependencies, { index, name }];
    Reflect.defineMetadata(SELF_DECLARED_DEPS_METADATA, dependencies, target);
  };
}
