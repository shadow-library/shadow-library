/**
 * Importing npm packages
 */

import { Route } from '@shadow-library/app';
import { JsonObject } from 'type-fest';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface DynamicRender<T extends JsonObject> {
  template: string;
  data: T;
}

/**
 * Declaring the constants
 */

export const HttpStatus = (status: number): MethodDecorator => Route({ status });

export const Header = (name: string, value: string | (() => string)): MethodDecorator => Route({ headers: { [name]: value } });

export const Redirect = (redirect: string, status = 301): MethodDecorator => Route({ redirect, status });

export const Render = (render?: string): MethodDecorator => Route({ render: render ?? true });
