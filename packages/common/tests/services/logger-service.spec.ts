/**
 * Importing npm packages
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

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

describe('Logger Service', () => {
  const winstonLogger = Logger['getInstance']();
  const maskedValue = '****';

  beforeEach(() => {
    jest.clearAllMocks();
  });

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
    const fn = jest.spyOn(winstonLogger, 'child');
    Logger.getLogger('test');
    expect(fn).toBeCalledWith({ label: 'test' });
  });

  it('should return the logger with metadata', () => {
    const fn = jest.spyOn(winstonLogger, 'child');
    Logger.getLogger({ name: 'test' });
    expect(fn).toBeCalledWith({ name: 'test' });
  });

  it('should add a dummy transport if no transport is provided', () => {
    expect(winstonLogger.transports).toHaveLength(1);
  });

  it('should add a transport and remove dummy transports', () => {
    const transport = new ConsoleTransport();
    Logger.addTransport(transport);

    expect(winstonLogger.transports).toHaveLength(1);
  });
});
