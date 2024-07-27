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
    const inner = { password: 'secret', api: {} };
    const array = [{ password: 'secret' }];
    const data = { username: 'username', password: 'password', inner, array };
    const value = Logger.maskFields(data, ['password', 'api']);

    expect(value).toBe(data);
    expect(data).toStrictEqual({
      username: 'username',
      password: maskedValue,
      inner: { password: maskedValue, api: maskedValue },
      array: [{ password: maskedValue }],
    });
  });

  it('should return the logger', () => {
    const logger = Logger.getLogger('test');

    const methods = ['info', 'http', 'error', 'warn', 'debug'] as const;
    methods.forEach(method => expect(logger[method]).toBeInstanceOf(Function));
  });

  it('should add a dummy transport if no transport is provided', () => {
    /** @ts-expect-error private property access */
    const logger = Logger.getInstance();
    expect(logger.transports).toHaveLength(1);
  });

  it('should add a transport', () => {
    const transport = new ConsoleTransport();
    /** @ts-expect-error private property access */
    const instance = Logger.addTransport(transport).getInstance();

    expect(instance.transports).toHaveLength(2);
  });
});
