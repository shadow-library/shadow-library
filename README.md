# Shadow Library

This GitHub repository is a comprehensive monorepo containing a suite of TypeScript library packages designed to be utilized across various microservices in the Shadow Apps ecosystem. Each library in this repository addresses specific common functionalities required by the microservices, ensuring consistency, reducing redundancy, and promoting reusability across the application landscape.

## Features

- **TypeScript Libraries:** Well-documented and typed libraries ensuring high reliability and ease of integration.
- **Modular Design:** Each package is designed to be self-contained, promoting a modular architecture.
- **Reusable Components:** Common utilities, services, and components that can be used across different microservices.
- **Consistent Standards:** Adherence to consistent coding standards and practices across all packages.
- **Automated Testing:** Comprehensive test suites for each package to ensure robustness and prevent regressions.
- **Continuous Integration:** Integrated CI/CD pipelines for automated testing, building, and deployment.
- **Version Control:** Managed versioning for each package to ensure compatibility and traceability.
- **Extensive Documentation:** Detailed documentation for each library package to facilitate ease of use and integration.

## Packages

- **[Application][shadow-app-docs]:** A progressive Node.js framework for building efficient, scalable, and enterprise-grade applications using SOLID principles.
- **[Common Services][shadow-common-docs]:** A TypeScript package offering a comprehensive set of common utilities and services used across your applications.
- **[Server][shadow-server-docs]:** A TypeScript package for building efficient Node.js servers with Fastify, featuring decorator-based routing, unified authentication, and response formatting with fast-json-stringify

## Getting Started

To start using the libraries in your microservices, follow the detailed setup instructions in the `README.md` file of each package. Installation and integration guidelines are provided to help you quickly get up and running.

## Contributing

We welcome contributions from the community. Please refer to our [contributing guide][contribution-guide] for information on how to get started, code standards, and our development workflow.

## License

This repository is licensed under the MIT License. See the `LICENSE` file for more information.

[contribution-guide]: https://github.com/leanderpaul/shadow-library/blob/master/CONTRIBUTING.md
[shadow-app-docs]: https://github.com/shadow-library/shadow-library/tree/main/packages/app
[shadow-common-docs]: https://github.com/shadow-library/shadow-library/tree/main/packages/common
[shadow-server-docs]: https://github.com/shadow-library/shadow-library/tree/main/packages/server
