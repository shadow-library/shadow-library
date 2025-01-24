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

describe('User', async () => {
  const app = await ShadowFactory.create(AppModule);
  const router: FastifyRouter = app.get(Router);

  describe('GET /users', async () => {
    it('should throw 401 for unauthenticated', async () => {
      const response = await router.mockRequest().get('/users');
      expect(response.statusCode).toBe(401);
      expect(response.json<unknown>()).toStrictEqual({
        code: 'A001',
        type: 'UNAUTHENTICATED',
        message: 'You are not authenticated',
      });
    });

    it('should throw 403 for normal user', async () => {
      const response = await router.mockRequest().get('/users').headers({ authorization: '2' });
      expect(response.statusCode).toBe(403);
      expect(response.json<unknown>()).toStrictEqual({
        code: 'A002',
        type: 'UNAUTHORIZED',
        message: 'You are not authorized',
      });
    });

    it('should return the list of users for admin', async () => {
      const response = await router.mockRequest().get('/users').headers({ authorization: '1' });
      const data = response.json<object[]>();
      expect(response.statusCode).toBe(200);
      for (const user of data) {
        expect(user).toHaveProperty('id', expect.any(Number));
        expect(user).toHaveProperty('name', expect.any(String));
        if ('admin' in user) expect(user).toHaveProperty('admin', expect.any(Boolean));
      }
    });
  });

  describe('GET /users/:id', async () => {
    it('should throw 401 for unauthenticated', async () => {
      const response = await router.mockRequest().get('/users/1');
      expect(response.statusCode).toBe(401);
      expect(response.json<unknown>()).toStrictEqual({
        code: 'A001',
        type: 'UNAUTHENTICATED',
        message: 'You are not authenticated',
      });
    });

    it('should throw 403 for normal user', async () => {
      const response = await router.mockRequest().get('/users/1').headers({ authorization: '2' });
      expect(response.statusCode).toBe(403);
      expect(response.json<unknown>()).toStrictEqual({
        code: 'A002',
        type: 'UNAUTHORIZED',
        message: 'You are not authorized',
      });
    });

    it('should return the user details for admin', async () => {
      const response = await router.mockRequest().get('/users/1').headers({ authorization: '1' });
      const user = response.json<object>();
      expect(response.statusCode).toBe(200);
      expect(user).toHaveProperty('id', 1);
      expect(user).toHaveProperty('name', 'Alice Smith');
      expect(user).toHaveProperty('admin', true);
    });

    it('should throw 404 for invalid id', async () => {
      const response = await router.mockRequest().get('/users/4').headers({ authorization: '1' });
      expect(response.statusCode).toBe(404);
      expect(response.json<unknown>()).toStrictEqual({
        code: 'A003',
        type: 'NOT_FOUND',
        message: 'User not found',
      });
    });
  });

  describe('GET /users/lookup/:name', async () => {
    it('should return true if user exists', async () => {
      const response = await router.mockRequest().get('/users/lookup/Alice Smith');
      expect(response.statusCode).toBe(200);
      expect(response.json<unknown>()).toStrictEqual({ exists: true });
    });

    it('should return false if user does not exist', async () => {
      const response = await router.mockRequest().get('/users/lookup/John Doe');
      expect(response.statusCode).toBe(200);
      expect(response.json<unknown>()).toStrictEqual({ exists: false });
    });
  });
});
