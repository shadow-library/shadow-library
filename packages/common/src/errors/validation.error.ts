/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { AppError, AppErrorObject } from './app.error';
import { ErrorCode } from './error-code.error';

/**
 * Defining types
 */

export interface FieldError {
  field: string;
  msg: string;
}

export interface ValidationErrorObject extends AppErrorObject {
  fields: FieldError[];
}

/**
 * Declaring the constants
 */

export class ValidationError extends AppError {
  private errors: FieldError[] = [];

  constructor();
  constructor(field: string, message: string);
  constructor(field?: string, message?: string) {
    super(ErrorCode.VALIDATION_ERROR);
    this.name = this.constructor.name;
    if (field && message) this.addFieldError(field, message);
  }

  static combineErrors(...errors: ValidationError[]): ValidationError {
    const combinedError = new ValidationError();
    for (const error of errors.flat()) {
      for (const fieldError of error.getErrors()) {
        combinedError.addFieldError(fieldError.field, fieldError.msg);
      }
    }
    return combinedError;
  }

  addFieldError(field: string, msg: string): ValidationError {
    this.errors.push({ field, msg });
    return this;
  }

  getErrors(): FieldError[] {
    return this.errors;
  }

  getErrorCount(): number {
    return this.errors.length;
  }

  getSummary(): string {
    const errors = this.getErrors();
    if (errors.length === 0) return 'Validation failed';
    else if (errors.length === 1) return `Validation failed for ${errors[0]?.field}`;

    const fields = errors.map(error => error.field);
    const lastField = fields.pop() as string;
    return `Validation failed for ${fields.join(', ')} and ${lastField}`;
  }

  override toObject(): ValidationErrorObject {
    return { ...super.toObject(), fields: this.getErrors() };
  }
}
