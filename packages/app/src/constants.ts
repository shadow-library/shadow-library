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

export const MODULE_METADATA = { IMPORTS: 'imports', PROVIDERS: 'providers', CONTROLLERS: 'controllers', EXPORTS: 'exports' } as const;

export const PATH_METADATA = 'path';
export const VERSION_METADATA = 'version';

export const PARAMTYPES_METADATA = 'design:paramtypes';
export const OPTIONAL_DEPS_METADATA = 'optional:paramtypes';
export const SELF_DECLARED_DEPS_METADATA = 'self:paramtypes';

export const CONTROLLER_WATERMARK = Symbol('controller');
export const INJECTABLE_WATERMARK = Symbol('injectable');

export const TRANSIENT_METADATA = Symbol('transient');
