# Shadow Errors

This TypeScript package provides a comprehensive collection of error classes designed to standardize error handling across your applications. It includes a variety of pre-defined error types to represent common error conditions, ensuring consistency and clarity in your error management strategy.

## Features

- **Standardized Errors:** Pre-defined error classes for common scenarios such as validation errors, authentication errors, and database errors.
- **Customizable:** Easily extendable to create custom error classes specific to your application's needs.
- **Detailed Information:** Each error class includes detailed properties like error codes, messages, and stack traces for better debugging.
- **Type Safety:** Leverages TypeScript's strong typing to catch errors at compile time and improve code reliability.
- **Consistent Handling:** Promotes a consistent error handling approach across different modules and services.

## Error Classes

- **AppError**: Base class for all application-specific errors.
- **InternalError:** Represents internal error that should not be known to the user.
- **NeverError:** Represents error that should never occur.
- **ValidationError:** Represents validation errors for user input and data.

## Getting Started

To use the error classes in your project, install the package and import the necessary classes:

```ts
import { AppError, ErrorCode, ValidationError } from '@shadow-library/errors';

// Example 1
throw new AppError(ErrorCode.S001);

// Example 2
throw new ValidationError('field', 'value');
```

## Installation

```bash
# npm
npm install @shadow-library/errors

# Yarn
yarn add @shadow-library/errors

# pnpm
pnpm add @shadow-library/errors
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.
