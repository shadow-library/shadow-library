# Shadow Types

This package provides a centralized collection of commonly used TypeScript types tailored for the Shadow Apps ecosystem. It includes a variety of type definitions for shared data structures, ensuring consistency and enhancing type safety across different microservices and modules.

## Features

- **Shared Types** Standardized types and interfaces used across the entire Shadow Apps ecosystem.
- **Reusable:** Promotes reusability and reduces redundancy by centralizing type definitions.
- **Consistent Interfaces:** Ensures consistent data structures and API contracts across different services.
- **Extensible:** Easily extendable to accommodate additional types specific to your application needs.

## Installation

```bash
# npm
npm install @shadow-library/types

# Yarn
yarn add @shadow-library/types

# pnpm
pnpm add @shadow-library/types
```

## Usage

```ts
import { JSONData } from '@shadow-library/types';

const data: JSONData = { name: 'John Doe', age: 20, admin: true };
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.
