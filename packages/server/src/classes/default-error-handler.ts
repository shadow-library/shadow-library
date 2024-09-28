/**
 * Importing npm packages
 */
import { AppError, ValidationError } from '@shadow-library/common';

/**
 * Importing user defined packages
 */
import { ErrorHandler, HttpRequest, HttpResponse } from '../interfaces';
import { ServerError } from '../server.error';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

export class DefaultErrorHandler implements ErrorHandler {
  handle(err: Error, _req: HttpRequest, res: HttpResponse): HttpResponse {
    if (err instanceof ServerError) return res.status(err.getStatusCode()).send(err.toObject());
    else if (err instanceof ValidationError) return res.status(400).send(err.toObject());
    else if (err instanceof AppError) return res.status(500).send(err.toObject());
    return res.status(500).send({ message: err.message ?? 'Internal Server Error' });
  }
}
