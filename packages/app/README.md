# Shadow Application

This TypeScript package is a framework for building efficient, scalable Node.js applications, emphasizing SOLID principles. It offers unparalleled flexibility through a meticulously crafted modular architecture, serving as a robust, elegant, and well-structured foundation for various applications. The framework introduces SOLID design patterns and well-established solutions to the Node.js landscape, enhancing testability with a sophisticated dependency injection system.

## Features

- **SOLID Principles:** Write maintainable and scalable code following the SOLID design principles.
- **Modular Architecture:** Provides a highly modular architecture with modules, controllers, and providers.
- **Dependency Injection:** Sophisticated system for enhancing testability and managing dependencies.
- **Lifecycle Methods:** Robust lifecycle management to handle initialization, running, and shutdown processes seamlessly.
- **Robust Foundation:** A strong, well-structured base for developing all types of server-side applications.

## Lifecycle Events

A shadow application manages all the lifecycle events in every application element. It provides lifecycle hooks that give visibility into key lifecycle events, and the ability to act (run registered code on your modules, providers or controllers) when they occur.

The lifecycle methods are divided into three phases: **initializing**, **running** and **terminating**. Using this lifecycle, you can plan for appropriate initialization of modules and services, manage active connections, and gracefully shutdown your application when it receives a termination signal.

The following diagram depicts the sequence of key application lifecycle events, from the time the application is bootstrapped until the node process exits.

![Lifecycle Events][lifecycle-events]

## Installation

```bash
# npm
npm install @shadow-library/app

# Yarn
yarn add @shadow-library/app

# pnpm
pnpm add @shadow-library/app
```

## Usage

```ts
import {} from '@shadow-library/app';
```

## License

This package is licensed under the MIT License. See the `LICENSE` file for more information.

[lifecycle-events]: https://firebasestorage.googleapis.com/v0/b/shadow-apps-376620.appspot.com/o/docs%2Fshadow-apps-lifecycle-events.webp?alt=media
