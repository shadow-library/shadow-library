/**
 * Importing npm packages
 */
import { ZodObject, ZodRawShape } from 'zod';

/**
 * Importing user defined packages
 */

import { ROUTE_INPUT_METADATA } from '../constants';

/**
 * Defining types
 */

export enum RouteInputType {
  BODY,
  PARAMS,
  QUERY,
}

export interface RouteInput<T extends ZodRawShape = any> {
  type: RouteInputType;
  index: number;
  schema?: ZodObject<T>;
}

/**
 * Declaring the constants
 */

export function RouteInput<T extends ZodRawShape>(type: RouteInputType, schema?: ZodObject<T>): ParameterDecorator {
  return (target, propertyKey, index) => {
    const input: RouteInput = { type, index };
    if (schema) input.schema = schema;

    const routeInputs: RouteInput[] = Reflect.getMetadata(ROUTE_INPUT_METADATA, target, propertyKey as string) ?? [];
    routeInputs.push(input);
    Reflect.defineMetadata(ROUTE_INPUT_METADATA, routeInputs, target, propertyKey as string);
  };
}

export const Body = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => RouteInput(RouteInputType.BODY, schema);

export const Params = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => RouteInput(RouteInputType.PARAMS, schema);

export const Query = <T extends ZodRawShape>(schema?: ZodObject<T>): ParameterDecorator => RouteInput(RouteInputType.QUERY, schema);
