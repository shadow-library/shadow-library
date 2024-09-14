# Shadow Common Services

This TypeScript package offers a collection of essential services and utility functions designed to be used across the Shadow Apps ecosystem. It includes common services like caching, logging, and configuration management, as well as various utility functions, promoting consistency and efficiency in your applications.

## Features

- **Caching Service:** A robust caching solution for managing in-memory and distributed caches.
- **Logger Service:** A flexible logging service supporting various logging levels and output formats.
- **Config Service:** A configuration management service for handling environment-specific settings and secrets.
- **Consistent API:** Standardized APIs for all services and utilities to ensure ease of use and integration.
- **TypeScript Support:** Fully typed interfaces and implementations for enhanced type safety and IntelliSense support.
- **Standardized Errors**: Pre-defined and easily extendable error classes for common scenarios such as validation errors, and Server errors.

## Installation

```bash
# npm
npm install @shadow-library/common

# Yarn
yarn add @shadow-library/common

# pnpm
pnpm add @shadow-library/common
```

## Usage

```ts
import { InMemoryStore, Config, Logger, ValidationError } from '@shadow-library/common';

const appName = Config.get('app.name');

const logger = Logger.getInstance();
logger.info('Application started');

const cache = new InMemoryStore();
cache.set('key', 'value');

const validationError = new ValidationError('fieldOne', 'value');
validationError.addFieldError('fieldTwo', 'value');
throw validationError;
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.
