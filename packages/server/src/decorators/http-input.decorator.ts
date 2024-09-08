/**
 * Importing npm packages
 */
import assert from 'assert';

import { PARAMTYPES_METADATA, Route } from '@shadow-library/app';
import { ZodObject, ZodRawShape } from 'zod';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export enum RouteInputType {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
  REQUEST = 'request',
  RESPONSE = 'response',
}

export type RouteInputSchemas = Partial<Record<RouteInputType, ZodObject<ZodRawShape>>>;

/**
 * Declaring the constants
 */

export function HttpInput<T extends ZodRawShape>(type: RouteInputType, schema?: ZodObject<T>): ParameterDecorator {
  return (target, propertyKey, index) => {
    assert(propertyKey, 'Cannot apply decorator to a constructor parameter');
    const paramTypes = Reflect.getMetadata(PARAMTYPES_METADATA, target, propertyKey);
    paramTypes[index] = type;

    if (schema) {
      const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
      assert(descriptor, 'Cannot apply decorator to a non-method');
      Route({ schemas: { [type]: schema } })(target, propertyKey, descriptor);
    }
  };
}

export const Body = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.BODY, schema);

export const Params = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.PARAMS, schema);

export const Query = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.QUERY, schema);

export const Req = (): ParameterDecorator => HttpInput(RouteInputType.REQUEST);

export const Res = (): ParameterDecorator => HttpInput(RouteInputType.RESPONSE);
