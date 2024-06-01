/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { ValidationError } from '@shadow-library/errors';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('ValidationError', () => {
  let validationError: ValidationError;

  it('should create an instance of ValidationError', () => {
    validationError = new ValidationError('fieldOne', 'value one');
    expect(validationError).toBeInstanceOf(ValidationError);
  });

  it('should add a field error', () => {
    validationError.addFieldError('fieldTwo', 'value two');
    expect(validationError.getErrorCount()).toBe(2);
  });

  it('should return the error message for single field', () => {
    const singleValidationError = new ValidationError('fieldOne', 'value one');
    expect(singleValidationError.getMessage()).toBe('Validation failed for fieldOne');
  });

  it('should return the error message for multiple fields', () => {
    expect(validationError.getMessage()).toBe('Validation failed for fieldOne and fieldTwo');

    const error = new ValidationError('fieldOne', 'value one').addFieldError('fieldTwo', 'value two').addFieldError('fieldThree', 'value three');
    expect(error.getMessage()).toBe('Validation failed for fieldOne, fieldTwo and fieldThree');
  });

  it('should return the errors', () => {
    const errors = validationError.getErrors();
    expect(errors).toStrictEqual([
      { field: 'fieldOne', msg: 'value one' },
      { field: 'fieldTwo', msg: 'value two' },
    ]);
  });
});
