/**
 * Importing npm packages
 */
import assert from 'assert';

import { Route } from '@shadow-library/app';
import { JSONSchema } from '@shadow-library/class-schema';

/**
 * Importing user defined packages
 */
import { PARAMTYPES_METADATA } from '../constants';

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

export type RouteInputSchemas = Partial<Record<'body' | 'params' | 'query', JSONSchema>>;

/**
 * Declaring the constants
 */

export function HttpInput<TObject>(type: RouteInputType, schema?: TObject): ParameterDecorator {
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

export const Body = (schema?: JSONSchema): ParameterDecorator => HttpInput(RouteInputType.BODY, schema);

export const Params = (schema?: JSONSchema): ParameterDecorator => HttpInput(RouteInputType.PARAMS, schema);

export const Query = (schema?: JSONSchema): ParameterDecorator => HttpInput(RouteInputType.QUERY, schema);

export const Request = (): ParameterDecorator => HttpInput(RouteInputType.REQUEST);
export const Req = Request;

export const Response = (): ParameterDecorator => HttpInput(RouteInputType.RESPONSE);
export const Res = Response;
