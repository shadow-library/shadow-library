/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Logger } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('LoggerService', () => {
  it('should mask sensitive data', () => {
    const data = { username: 'username', password: 'password', inner: { password: 'secret' } };
    const maskedData = Logger.removeSensitiveFields(data, ['password']);
    expect(maskedData).toStrictEqual({ username: 'username', password: '****', inner: { password: '****' } });
  });

  it('should return dummy logger instance when not inited', () => {
    const logger = Logger.getLogger('test');
    expect(logger).toBeInstanceOf(Logger); // Since actual would return the WinstonLogger instance
  });

  it('should init the logger instance', () => {
    Logger.initInstance();
    const logger = Logger.getLogger('test');
    expect(logger).not.toBeInstanceOf(Logger); // Since actual would return the WinstonLogger instance
  });

  it('should throw error if logger instance already initialized', () => {
    expect(() => Logger.initInstance()).toThrowError();
  });
});
