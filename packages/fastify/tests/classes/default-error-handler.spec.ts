/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { AppError, ValidationError } from '@shadow-library/common';
import { errorCodes } from 'fastify';

/**
 * Importing user defined packages
 */
import { DefaultErrorHandler, ServerError, ServerErrorCode } from '@shadow-library/fastify';

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
    jest.clearAllMocks();
  });

  it('should handle server error', () => {
    const error = new ServerError(ServerErrorCode.S001);
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(ServerErrorCode.S001.getStatusCode());
    expect(response.send).toHaveBeenCalledWith(body);
  });

  it('should handle validation error', () => {
    const error = new ValidationError('name', 'Invalid Name');
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.send).toHaveBeenCalledWith({
      code: 'S003',
      type: 'VALIDATION_ERROR',
      message: 'Validation Error',
      fields: [{ field: 'name', msg: 'Invalid Name' }],
    });
  });

  it('should handle app error', () => {
    const error = new AppError(ServerErrorCode.S001);
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith(body);
  });

  it('should handle fastify error', () => {
    const error = errorCodes.FST_ERR_CTP_INVALID_MEDIA_TYPE('application/unknown');
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(415);
    expect(response.send).toHaveBeenCalledWith({
      type: 'CLIENT_ERROR',
      code: 'FST_ERR_CTP_INVALID_MEDIA_TYPE',
      message: 'Unsupported Media Type: application/unknown',
    });
  });

  it('should handle fastify server error', () => {
    const error = errorCodes.FST_ERR_HOOK_TIMEOUT();
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ code: 'S001', message: 'Unexpected Server Error', type: 'SERVER_ERROR' });
  });

  it('should log the cause of the error', () => {
    const error = new AppError(ServerErrorCode.S001).setCause(new Error('Test Cause'));
    const fn = jest.spyOn(errorHandler['logger'], 'warn');
    errorHandler.handle(error, request, response);
    expect(fn).toHaveBeenCalledWith('Caused by:', error.getCause());
  });

  it('should handle unknown error of type Error', () => {
    const error = new Error('Test Error');
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ code: 'S001', message: 'Unexpected Server Error', type: 'SERVER_ERROR' });
  });

  it('should handle unknown error of type unknown', () => {
    const error = { error: 'Test Error' } as any;
    errorHandler.handle(error, request, response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.send).toHaveBeenCalledWith({ code: 'S001', message: 'Unexpected Server Error', type: 'SERVER_ERROR' });
  });
});
