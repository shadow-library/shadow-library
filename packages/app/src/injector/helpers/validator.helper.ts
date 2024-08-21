/**
 * Importing npm packages
 */
import { Class } from 'type-fest';

/**
 * Importing user defined packages
 */
import { INJECTABLE_WATERMARK, ROUTE_WATERMARK } from '../../constants';
import { FactoryProvider, Provider } from '../../interfaces';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

class ValidatorStatic {
  isInjectable(provider: Class<unknown>): boolean {
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
