/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { DefaultErrorHandler, ServerError, ServerErrorCode } from '@shadow-library/server';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('DefaultErrorHandler', () => {
  const request = {} as any;
  const response = { status: jest.fn().mockReturnThis(), send: jest.fn().mockReturnThis() } as any;
  const body = { code: 'S001', type: 'SERVER_ERROR', message: expect.any(String) };
  let errorHandler: DefaultErrorHandler;

  beforeEach(() => {
    errorHandler = new DefaultErrorHandler();
  });

  it('should handle server error', () => {
    const error = new ServerError(ServerErrorCode.S001);
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(ServerErrorCode.S001.getStatusCode());
    expect(response.send).toHaveBeenCalledWith(body);
  });

  it('should handle app error', () => {
    const error = new AppError(ServerErrorCode.S001);
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith(body);
  });

  it('should handle unknown error of type Error', () => {
    const error = new Error('Test Error');
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ message: 'Test Error' });
  });

  it('should handle unknown error of type unknown', () => {
    const error = { error: 'Test Error' } as any;
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ message: 'Internal Server Error' });
  });
});
