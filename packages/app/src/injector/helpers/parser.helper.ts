/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/common';
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { isClassProvider, isFactoryProvider, isValueProvider } from './provider-classifier';
import { Validator } from './validator.helper';
import { OPTIONAL_DEPS_METADATA, PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from '../../constants';
import { InjectMetadata } from '../../decorators';
import { FactoryDependency, InjectionToken, Provider } from '../../interfaces';

/**
 * Defining types
 */

interface ParsedInjection {
  name: InjectionToken;
  optional: boolean;
}

interface ParsedProvider {
  name: InjectionToken;
  useFactory: (...args: any[]) => any | Promise<any>;
  inject: ParsedInjection[];
}

/**
 * Declaring the constants
 */

class ParserStatic {
  parseInjection(injection: FactoryDependency | InjectionToken): ParsedInjection {
    if (typeof injection === 'object' && 'token' in injection) return { name: injection.token, optional: injection.optional };
    return { name: injection, optional: true };
  }

  parseProvider(provider: Provider): ParsedProvider {
    if (isValueProvider(provider)) return { name: provider.token, useFactory: () => provider.useValue, inject: [] };

    if (isFactoryProvider(provider) && Validator.isFactoryProvider(provider)) {
      const inject = provider.inject ?? [];
      return { name: provider.token, useFactory: provider.useFactory, inject: inject.map(i => this.parseInjection(i)) };
    }

    const { token, useClass: Class } = isClassProvider(provider) ? provider : { token: provider, useClass: provider };
    const injectable = Validator.isInjectable(Class);
    if (!injectable) throw new InternalError(`Class '${Class.name}' is not an injectable provider`);
    const dependencies = [] as FactoryDependency[];
    const paramtypes: Class<unknown>[] = Reflect.getMetadata(PARAMTYPES_METADATA, Class);
    const selfDependencies: InjectMetadata[] = Reflect.getMetadata(SELF_DECLARED_DEPS_METADATA, Class) ?? [];
    const optionalDependencies: number[] = Reflect.getMetadata(OPTIONAL_DEPS_METADATA, Class) ?? [];
    for (const dependency of paramtypes) dependencies.push({ token: dependency, optional: false });
    for (const dependency of selfDependencies) dependencies[dependency.index] = { token: dependency.token, optional: false };
    for (const index of optionalDependencies) dependencies[index]!.optional = true;

    const inject = dependencies.map(d => this.parseInjection(d));
    return { name: token, useFactory: (...args: any) => new Class(...args), inject };
  }
}

export const Parser = new ParserStatic();
