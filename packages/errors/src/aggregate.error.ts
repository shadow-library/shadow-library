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
const DEFAULT_NAMESPACE = 'DEFAULT';

export class AggregateError extends Error {
  private readonly errors = new Map<string, Error[]>();

  constructor(message: string) {
    super(message);
    this.name = 'AggregateError';
  }

  getMessage(): string {
    return this.message;
  }

  addError(error: Error): this;
  addError(namespace: string, error: Error): this;
  addError(namespaceOrError: string | Error, error?: Error): this {
    const [namespace, currentError] = typeof namespaceOrError === 'string' ? [namespaceOrError, error!] : [DEFAULT_NAMESPACE, namespaceOrError];
    const previousError = this.errors.get(namespace);
    const newError = previousError ? [...previousError, currentError] : [currentError];
    this.errors.set(namespace, newError);
    return this;
  }

  getErrors(): Error[];
  getErrors(namespace: string): Error[];
  getErrors(namespace: string = DEFAULT_NAMESPACE): Error[] {
    return this.errors.get(namespace) ?? [];
  }

  entries(): IterableIterator<[string, Error[]]> {
    return this.errors.entries();
  }
}
