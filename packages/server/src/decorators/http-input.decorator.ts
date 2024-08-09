/**
 * Importing npm packages
 */
import { Route } from '@shadow-library/app';
import { ZodObject, ZodRawShape } from 'zod';

/**
 * Importing user defined packages
 */

import { ROUTE_INPUT_METADATA } from '../constants';

/**
 * Defining types
 */

export enum RouteInputType {
  BODY = 'body',
  PARAMS = 'params',
  QUERY = 'query',
}

export type RouteInputSchemas = Partial<Record<RouteInputType, ZodObject<ZodRawShape>>>;

/**
 * Declaring the constants
 */

export function HttpInput<T extends ZodRawShape>(type: RouteInputType, schema?: ZodObject<T>): ParameterDecorator {
  return (target, propertyKey, index) => {
    const oldMetadata = Reflect.getMetadata(ROUTE_INPUT_METADATA, target, propertyKey as string) ?? {};
    const newMetadata = { ...oldMetadata, [type]: index };
    Reflect.defineMetadata(ROUTE_INPUT_METADATA, newMetadata, target, propertyKey as string);

    if (schema) {
      const schemas: RouteInputSchemas = { [type]: schema };
      const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey as string);
      Route({ schemas })(target, propertyKey!, descriptor!);
    }
  };
}

export const Body = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.BODY, schema);

export const Params = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.PARAMS, schema);

export const Query = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => HttpInput(RouteInputType.QUERY, schema);
