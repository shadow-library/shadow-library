/**
 * Importing npm packages
 */
import { Type } from '@shadow-library/types';

/**
 * Importing user defined packages
 */
import { INJECTABLE_WATERMARK, ROUTE_WATERMARK } from '@shadow-library/app/constants';
import { FactoryProvider, Provider } from '@shadow-library/app/interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ValidatorStatic {
  isInjectable(provider: Type): boolean {
    return Reflect.getMetadata(INJECTABLE_WATERMARK, provider) ?? false;
  }

  isFactoryProvider(provider: Provider): provider is FactoryProvider {
    return 'useFactory' in provider;
  }

  isRoute(method: object): boolean {
    return Reflect.hasMetadata(ROUTE_WATERMARK, method);
  }
}

export const Validator = new ValidatorStatic();
