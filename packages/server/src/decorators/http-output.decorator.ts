/**
 * Importing npm packages
 */

import { Route } from '@shadow-library/app';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export const HttpStatus = (status: number): MethodDecorator => Route({ status });

export const Header = (headers: Record<string, string | (() => string)>): MethodDecorator => Route({ headers });

export const Redirect = (redirect: string, status = 301): MethodDecorator => Route({ redirect, status });

export const Render = (render: string): MethodDecorator => Route({ render });
