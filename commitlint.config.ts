/**
 * Importing npm packages
 */
import { UserConfig } from '@commitlint/types';

/**
 * Declaring the constants
 */

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [2, 'always', ['errors', 'types']],
  },
};

export default config;
