/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ValidationError } from '@shadow-library/common';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ValidationError', () => {
  it('should create an instance of ValidationError', () => {
    const error = new ValidationError('fieldOne', 'value one');
    expect(error.message).toBe('Validation Error');
    expect(error).toBeInstanceOf(ValidationError);
  });

  it('should add a field error', () => {
    const error = new ValidationError('fieldOne', 'value one').addFieldError('fieldTwo', 'value two');
    expect(error.getErrorCount()).toBe(2);
  });

  it('should throw generic error for no error fields', () => {
    const error = new ValidationError();
    expect(error.getSummary()).toBe('Validation failed');
  });

  it('should return the error message for single field', () => {
    const msg = 'Validation failed for fieldOne';
    const error = new ValidationError('fieldOne', 'value one');

    expect(error.getSummary()).toBe(msg);
  });

  it('should return the error message for multiple fields', () => {
    const error = new ValidationError('fieldOne', 'value one').addFieldError('fieldTwo', 'value two');
    expect(error.getSummary()).toBe('Validation failed for fieldOne and fieldTwo');

    error.addFieldError('fieldThree', 'value three');
    expect(error.getSummary()).toBe('Validation failed for fieldOne, fieldTwo and fieldThree');
  });

  it('should return the errors', () => {
    const error = new ValidationError('fieldOne', 'value one').addFieldError('fieldTwo', 'value two');
    const errors = error.getErrors();
    expect(errors).toStrictEqual([
      { field: 'fieldOne', msg: 'value one' },
      { field: 'fieldTwo', msg: 'value two' },
    ]);
  });

  it('should return the error object', () => {
    const error = new ValidationError('fieldOne', 'value one').addFieldError('fieldTwo', 'value two');
    expect(error.toObject()).toStrictEqual({
      code: 'VALIDATION_ERROR',
      type: 'VALIDATION_ERROR',
      message: 'Validation Error',
      fields: [
        { field: 'fieldOne', msg: 'value one' },
        { field: 'fieldTwo', msg: 'value two' },
      ],
    });
  });

  it('should combine errors', () => {
    const errorOne = new ValidationError('fieldOne', 'value one');
    const errorTwo = new ValidationError('fieldTwo', 'value two');
    const combinedError = ValidationError.combineErrors(errorOne, errorTwo);

    expect(combinedError).toBeInstanceOf(ValidationError);
    expect(combinedError.getErrorCount()).toBe(2);
    expect(combinedError.getErrors()).toStrictEqual([
      { field: 'fieldOne', msg: 'value one' },
      { field: 'fieldTwo', msg: 'value two' },
    ]);
  });
});
