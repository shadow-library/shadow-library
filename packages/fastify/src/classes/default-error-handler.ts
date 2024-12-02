/**
 * Importing npm packages
 */
import { AppError, AppErrorObject, ErrorType, ValidationError } from '@shadow-library/common';
import { FastifyError } from 'fastify';

/**
 * Importing user defined packages
 */
import { ErrorHandler, HttpRequest, HttpResponse } from '../interfaces';
import { ServerError, ServerErrorCode } from '../server.error';

/**
 * Defining types
 */

export interface ParsedFastifyError {
  statusCode: number;
  error: AppErrorObject;
}

/**
 * Declaring the constants
 */
const unexpectedError = new ServerError(ServerErrorCode.S001);

export class DefaultErrorHandler implements ErrorHandler {
  protected parseFastifyError(err: FastifyError): ParsedFastifyError {
    if (err.statusCode === 500) return { statusCode: 500, error: unexpectedError.toObject() };

    return {
      statusCode: err.statusCode as number,
      error: {
        code: err.code,
        type: ErrorType.CLIENT_ERROR,
        message: err.message,
      },
    };
  }

  handle(err: Error, _req: HttpRequest, res: HttpResponse): HttpResponse {
    if (err instanceof ServerError) return res.status(err.getStatusCode()).send(err.toObject());
    else if (err instanceof ValidationError) return res.status(400).send(err.toObject());
    else if (err instanceof AppError) return res.status(500).send(err.toObject());
    else if (err.name === 'FastifyError') {
      const { statusCode, error } = this.parseFastifyError(err as FastifyError);
      return res.status(statusCode).send(error);
    }

    return res.status(500).send({ message: err.message ?? 'Internal Server Error' });
  }
}