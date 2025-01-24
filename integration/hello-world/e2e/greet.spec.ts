/**
 * Importing npm packages
 */
import { describe, expect, it } from 'bun:test';

import { Router, ShadowFactory } from '@shadow-library/app';
import { FastifyRouter } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { AppModule } from '../src/app.module';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Greet', async () => {
  const app = await ShadowFactory.create(AppModule);
  const router: FastifyRouter = app.get(Router);

  it('should return a greeting message', async () => {
    const response = await router.mockRequest().get('/greet/sync');
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toStrictEqual({ msg: 'Hello, World!' });
  });

  it('should return a greeting message for user', async () => {
    const response = await router.mockRequest().post('/greet/async').payload({ name: 'John' });
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toStrictEqual({ msg: 'Hello, John!' });
  });

  it('should return a greeting message for user with salutation', async () => {
    const response = await router.mockRequest().post('/greet/async').payload({ name: 'John', gender: 'M' });
    expect(response.statusCode).toBe(200);
    expect(response.json<unknown>()).toStrictEqual({ msg: 'Hello, Mr.John!' });
  });

  it('should throw an error if name is not provided', async () => {
    const response = await router.mockRequest().post('/greet/async').payload({});
    expect(response.statusCode).toBe(400);
    expect(response.json<unknown>()).toStrictEqual({
      code: 'S003',
      type: 'VALIDATION_ERROR',
      message: 'Validation Error',
      fields: [{ field: 'body', msg: `must have required property 'name'` }],
    });
  });

  it('should throw an error if name is invalid', async () => {
    const response = await router.mockRequest().post('/greet/async').payload({ name: 'I' });
    expect(response.statusCode).toBe(400);
    expect(response.json<unknown>()).toStrictEqual({
      code: 'S003',
      type: 'VALIDATION_ERROR',
      message: 'Validation Error',
      fields: [{ field: 'body.name', msg: 'must match pattern "^[a-zA-Z ]{3,32}$"' }],
    });
  });

  it('should throw an error if gender is invalid', async () => {
    const response = await router.mockRequest().post('/greet/async').payload({ name: 'John', gender: 'X' });
    expect(response.statusCode).toBe(400);
    expect(response.json<unknown>()).toStrictEqual({
      code: 'S003',
      type: 'VALIDATION_ERROR',
      message: 'Validation Error',
      fields: [{ field: 'body.gender', msg: 'must be equal to one of the allowed values: M, F, U' }],
    });
  });
});
