/**
 * Importing npm packages
 */
import { InternalError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */
import { OPTIONAL_DEPS_METADATA, PARAMTYPES_METADATA, SELF_DECLARED_DEPS_METADATA } from '@shadow-library/app/constants';
import { InjectMetadata } from '@shadow-library/app/decorators';
import { FactoryProviderInject, InjectionName, Provider } from '@shadow-library/app/interfaces';

import { Extractor } from './extractor.helper';
import { Validator } from './validator.helper';

/**
 * Defining types
 */

interface ParsedInjection {
  name: InjectionName;
  optional: boolean;
}

interface ParsedProvider {
  name: InjectionName;
  useFactory: (...args: any[]) => any | Promise<any>;
  inject: ParsedInjection[];
}

/**
 * Declaring the constants
 */

class ParserStatic {
  parseInjection(injection: FactoryProviderInject): ParsedInjection {
    if (typeof injection === 'object' && 'name' in injection) return { name: injection.name, optional: injection.optional ?? false };
    return { name: injection, optional: false };
  }

  parseProvider(provider: Provider): ParsedProvider {
    if ('useValue' in provider) return { name: provider.name, useFactory: () => provider.useValue, inject: [] };

    if (Validator.isFactoryProvider(provider)) {
      const inject = provider.inject ?? [];
      return { name: provider.name, useFactory: provider.useFactory, inject: inject.map(i => this.parseInjection(i)) };
    }

    const classProvider = typeof provider === 'function' ? { name: provider, useClass: provider } : provider;
    const injectable = Validator.isInjectable(classProvider.useClass);
    if (!injectable) throw new InternalError(`Class '${classProvider.useClass.name}' is not an injectable provider`);
    const dependencies = Extractor.getMetadata<FactoryProviderInject>(PARAMTYPES_METADATA, classProvider.useClass);
    const selfDependencies = Extractor.getMetadata<InjectMetadata>(SELF_DECLARED_DEPS_METADATA, classProvider.useClass);
    for (const dependency of selfDependencies) dependencies[dependency.index] = dependency.name;
    const optionalDependencies = Extractor.getMetadata<number>(OPTIONAL_DEPS_METADATA, classProvider.useClass);
    for (const index of optionalDependencies) {
      const dependency = dependencies[index] as FactoryProviderInject;
      const name = typeof dependency === 'object' && 'name' in dependency ? dependency.name : dependency;
      dependencies[index] = { name, optional: true };
    }

    const inject = dependencies.map(d => this.parseInjection(d));
    return { name: classProvider.name, useFactory: (...args: any) => new classProvider.useClass(...args), inject };
  }
}

export const Parser = new ParserStatic();
