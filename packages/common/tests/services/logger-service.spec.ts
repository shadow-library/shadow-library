/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ConsoleTransport, Logger } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const maskedValue = '****';

describe('Logger Service', () => {
  it('should mask sensitive data', () => {
    const redactor = Logger.getRedactor(['password']);
    const data = { username: 'username', password: 'password' };
    const value = redactor(data);

    expect(value).toBe(data);
    expect(data).toStrictEqual({ username: 'username', password: 'xxxx' });
  });

  it('should mask sensitive data with provided censor', () => {
    const redactor = Logger.getRedactor(['password'], maskedValue);
    const data = { username: 'username', password: 'password' };
    const value = redactor(data);

    expect(value).toBe(data);
    expect(data).toStrictEqual({ username: 'username', password: maskedValue });
  });

  it('should return the logger', () => {
    const logger = Logger.getLogger('test');

    const methods = ['info', 'http', 'error', 'warn', 'debug'] as const;
    methods.forEach(method => expect(logger[method]).toBeInstanceOf(Function));
  });

  it('should add a dummy transport if no transport is provided', () => {
    const logger = Logger['getInstance']();
    expect(logger.transports).toHaveLength(1);
  });

  it('should add a transport and remove dummy transports', () => {
    const transport = new ConsoleTransport();
    const instance = Logger.addTransport(transport)['getInstance']();

    expect(instance.transports).toHaveLength(1);
  });
});
