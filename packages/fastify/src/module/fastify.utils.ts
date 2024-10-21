/**
 * Importing npm packages
 */

import { ValidationError, throwError, utils } from '@shadow-library/common';
import { FastifyInstance, fastify } from 'fastify';
import { FastifySchemaValidationError, SchemaErrorDataVar } from 'fastify/types/schema';

import { FastifyConfig, FastifyModuleOptions } from './fastify-module.interface';
import { ServerError, ServerErrorCode } from '../server.error';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

const notFoundError = new ServerError(ServerErrorCode.S002);
export const notFoundHandler = (): never => throwError(notFoundError);

export function formatSchemaErrors(errors: FastifySchemaValidationError[], dataVar: SchemaErrorDataVar): ValidationError {
  const validationError = new ValidationError();
  for (const error of errors) {
    let key = dataVar;
    if (error.instancePath) key += error.instancePath.replaceAll('/', '.');
    validationError.addFieldError(key, error.message ?? 'Field validation failed');
  }
  return validationError;
}

export async function createFastifyInstance(config: FastifyConfig, fastifyFactory?: FastifyModuleOptions['fastifyFactory']): Promise<FastifyInstance> {
  const options = utils.object.omitKeys(config, ['port', 'host', 'errorHandler', 'responseSchema']);
  const { errorHandler } = config;
  const instance = fastify(options);

  instance.setSchemaErrorFormatter(formatSchemaErrors);
  instance.setNotFoundHandler(notFoundHandler);
  instance.setErrorHandler(errorHandler.handle.bind(errorHandler));

  return fastifyFactory ? await fastifyFactory(instance) : instance;
}
