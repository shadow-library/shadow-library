/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { FastifyRouter } from '@shadow-library/fastify';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('FastifyRouter', () => {
  let router: FastifyRouter;
  const config = { port: 3000, host: 'localhost' };
  const instance = { listen: jest.fn(), close: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    router = new FastifyRouter(config as any, instance as any);
  });

  it('should register the routes', () => {
    router.register();
  });

  it('should start the server', async () => {
    await router.start();
    expect(instance.listen).toBeCalledWith({ port: 3000, host: 'localhost' });
  });

  it('should stop the server', async () => {
    await router.stop();
    expect(instance.close).toBeCalled();
  });
});
