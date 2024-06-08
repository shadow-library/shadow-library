# Shadow Database

This TypeScript package offers a streamlined and powerful way to connect to a MongoDB database, providing auto-generated CRUD operations, schema validation, and REST API access for your collections.

## Features

- **MongoDB Connection:** Simplifies connecting to a MongoDB database.
- **JSON Schema Configuration:** Users provide the design and relationships of collections via a JSON file.
- **Auto-Generated Modules:** Generates TypeScript modules to handle CRUD operations for each collection based on the provided JSON schema.
- **Schema Enforcement:** Automatically validates and enforces schema constraints for collections.
- **REST API Integration:** Provides methods to read data from MongoDB using REST API URL patterns.

## Installation

```bash
# npm
npm install @shadow-library/database

# Yarn
yarn add @shadow-library/database

# pnpm
pnpm add @shadow-library/database
```

## Usage

```ts
import {} from '@shadow-library/database';
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.
