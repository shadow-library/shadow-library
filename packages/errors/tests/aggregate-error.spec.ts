/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { AggregateError } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('AggregateError', () => {
  let aggregateError: AggregateError;
  const error1 = new Error('Error 1');
  const error2 = new Error('Error 2');
  const error3 = new Error('Error 3');
  const msg = 'Aggregate Error';

  it('should create an instance of AggregateError', () => {
    aggregateError = new AggregateError(msg);
    expect(aggregateError.name).toBe('AggregateError');
    expect(aggregateError).toBeInstanceOf(AggregateError);
  });

  it('should return the error message', () => {
    expect(aggregateError.message).toBe(msg);
    expect(aggregateError.getMessage()).toBe(msg);
  });

  it('should add and return an error without namespace', () => {
    aggregateError.addError(error1);
    expect(aggregateError.getErrors()).toContain(error1);
  });

  it('should add and return an error with a namespace', () => {
    aggregateError.addError('NAMESPACE', error2);
    expect(aggregateError.getErrors('NAMESPACE')).toContain(error2);
  });

  it('should add multiple errors', () => {
    aggregateError.addError(error3).addError('NAMESPACE', error3);
    expect(aggregateError.getErrors()).toStrictEqual([error1, error3]);
    expect(aggregateError.getErrors('NAMESPACE')).toStrictEqual([error2, error3]);
  });

  it('should return an empty array for an unknown namespace', () => {
    expect(aggregateError.getErrors('UNKNOWN')).toEqual([]);
  });

  it('should return an iterator', () => {
    const iterator = aggregateError.entries();
    expect(iterator.next().value).toEqual(['DEFAULT', [error1, error3]]);
    expect(iterator.next().value).toEqual(['NAMESPACE', [error2, error3]]);
  });
});
