/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { ValidationError } from '@shadow-library/common';
import { FastifyInstance } from 'fastify';

/**
 * Importing user defined packages
 */
import { ServerError } from '@shadow-library/fastify';
import { createFastifyInstance, formatSchemaErrors, notFoundHandler } from '@shadow-library/fastify/module/fastify.utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

jest.mock('fastify', () => ({
  fastify: jest.fn().mockReturnValue({
    setNotFoundHandler: jest.fn(),
    setErrorHandler: jest.fn(),
    setSchemaErrorFormatter: jest.fn(),

    getDefaultJsonParser: jest.fn(),
    addContentTypeParser: jest.fn(),
    addHook: jest.fn(),

    route: jest.fn(),
    listen: jest.fn(),
    close: jest.fn(),
  }),
}));

describe('Create Fastify Instance', () => {
  let instance: FastifyInstance;
  const fastifyFactory = jest.fn((instance: FastifyInstance) => instance);
  const errorHandler = { handle: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    instance = await createFastifyInstance({ host: '', port: 3000, errorHandler }, fastifyFactory);
  });

  it('should create the object and fastify instance', async () => {
    expect(instance).toBeDefined();
    expect(instance.setNotFoundHandler).toHaveBeenCalled();
    expect(instance.setErrorHandler).toHaveBeenCalled();
    expect(instance.setSchemaErrorFormatter).toHaveBeenCalled();
    expect(fastifyFactory).toHaveBeenCalled();
  });

  it('should create the object and fastify instance without fastifyFactory', async () => {
    instance = await createFastifyInstance({ host: '', port: 3000, errorHandler });
    expect(instance).toBeDefined();
    expect(instance.setNotFoundHandler).toHaveBeenCalled();
    expect(instance.setErrorHandler).toHaveBeenCalled();
    expect(instance.setSchemaErrorFormatter).toHaveBeenCalled();
  });

  it('should handle not found error', () => {
    expect(() => notFoundHandler()).toThrow(ServerError);
  });

  it('should format the schema errors', () => {
    const errors = [
      { instancePath: '', message: "must have required property 'password'", keyword: 'required', params: { missingProperty: 'rand' } },
      { instancePath: '/email', params: {} },
      { instancePath: '/gender', message: 'must be one of', keyword: 'enum', params: { allowedValues: ['Male', 'Female'] } },
    ];
    const formattedError = formatSchemaErrors(errors as any, 'body');

    expect(formattedError).toBeInstanceOf(ValidationError);
    expect(formattedError.getErrors()).toStrictEqual([
      { field: 'body', msg: `must have required property 'password'` },
      { field: 'body.email', msg: 'Field validation failed' },
      { field: 'body.gender', msg: 'must be one of: Male, Female' },
    ]);
  });
});
