/**
 * Importing npm packages
 */
import { NeverError } from '@shadow-library/errors';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

type Decorator = ClassDecorator | MethodDecorator | PropertyDecorator;

/**
 * Declaring the constants
 */

export function applyDecorators(...decorators: Decorator[]): Decorator {
  return (target: object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<object>) => {
    for (const decorator of decorators) {
      if (target instanceof Function && !descriptor) (decorator as ClassDecorator)(target);
      else if (propertyKey && descriptor) (decorator as MethodDecorator | PropertyDecorator)(target, propertyKey, descriptor);
      else throw new NeverError('Invalid or unknown decorator type');
    }
  };
}
