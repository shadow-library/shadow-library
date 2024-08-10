/**
 * Importing npm packages
 */
import assert from 'assert';

import { Route } from '@shadow-library/app';
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
}

export type RouteInputSchemas = Partial<Record<RouteInputType, ZodObject<ZodRawShape>>>;

export type RouteInputArgs = Record<RouteInputType, number>;

/**
 * Declaring the constants
 */

export function HttpInput<T extends ZodRawShape>(type: RouteInputType, schema?: ZodObject<T>): ParameterDecorator {
  return (target, propertyKey, index) => {
    assert(propertyKey, 'Cannot apply decorator to a constructor parameter');
    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey);
    assert(descriptor, 'Cannot apply decorator to a non-method');

    const metadata = { args: { [type]: index } } as Record<string, any>;
    if (schema) metadata.schemas = { [type]: schema };
    return Route(metadata)(target, propertyKey, descriptor);
  };
}

export const Body = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.BODY, schema);

export const Params = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.PARAMS, schema);

export const Query = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.QUERY, schema);
