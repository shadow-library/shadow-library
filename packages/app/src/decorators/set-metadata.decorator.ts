/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

/**
 * Decorator that assigns metadata to the class/function using the
 * specified `key`.
 *
 * Requires two parameters:
 * - `key` - a value defining the key under which the metadata is stored
 * - `value` - metadata to be associated with `key`
 *
 * This metadata can be reflected using the `Reflector` class.
 *
 * Example: `@SetMetadata('roles', ['admin'])`
 */
export function SetMetadata<K = string, V = any>(key: K, value: V): MethodDecorator & ClassDecorator {
  return function (target: object, _propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    if (descriptor?.value) {
      Reflect.defineMetadata(key, value, descriptor.value);
      return descriptor;
    }

    Reflect.defineMetadata(key, value, target);
    return target;
  } as MethodDecorator & ClassDecorator;
}
