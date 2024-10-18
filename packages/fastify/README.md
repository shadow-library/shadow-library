# Shadow Server

This TypeScript package is a powerful Node.js server implementation built as a wrapper around the Fastify package. It offers features such as body, query,
and URL parameter validation using AJV for speed, response formatting with fast-json-stringify, and a unified approach to authentication and authorization.
The package uses decorators to define controller classes and HTTP methods, and includes a render decorator for templating engine support.

## Features

**Fastify Wrapper:** Built on top of the high-performance Fastify framework.
**Validation:** Fast validation for body, query, and URL parameters using AJV.
**Response Serialization:** Consistent serialization of response types with fast-json-stringify to ensure only expected fields are returned.
**Decorator-Based:** Use decorators to define controllers and HTTP methods.
**Authentication and Authorization:** Unified methods to implement authentication and authorization.
**Templating Support:** Render decorator for integrating templating engines.

## Usage

```ts
import {} from '@shadow-library/server';
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.
