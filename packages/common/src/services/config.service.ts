/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */
import { Utils } from '../internal.utils';

/**
 * Defining types
 */

export interface ConfigOptions<T = any> {
  envKey?: string;
  isProdRequired?: boolean;
  validateType?: 'number' | 'boolean';
  validator?: (value: string) => boolean;
  defaultValue?: string;
  allowedValues?: string[];
  transform?: (value: string) => T;
}

export type NodeEnv = 'development' | 'production' | 'test';

export type LogLevel = 'silly' | 'debug' | 'http' | 'info' | 'warn' | 'error';

export interface ConfigRecords {
  /** Application configs */
  'app.env': NodeEnv;
  'app.name': string;

  /** Log configs */
  'log.level': LogLevel;
  'log.dir': string;
  'log.buffer.size': number;

  /** AWS configs */
  'aws.region': string;
  'aws.cloudwatch.log-group': string;
  'aws.cloudwatch.log-stream': string;
  'aws.cloudwatch.upload-rate': number;
}

/**
 * Declaring the constants
 */

export class ConfigService<Configs extends ConfigRecords = ConfigRecords> {
  private readonly cache = new Map<keyof Configs, any>();

  constructor(configs?: Partial<Configs>) {
    if (configs && Object.keys(configs).length > 0) {
      for (const key in configs) this.cache.set(key, configs[key]);
    }

    const defaultAppName = 'shadow-app';
    const appEnvs = ['development', 'production', 'test'];
    const logLevels = ['silly', 'debug', 'http', 'info', 'warn', 'error'];

    this.set('app.env', { envKey: 'NODE_ENV', allowedValues: appEnvs, defaultValue: 'development' });
    this.set('app.name', { defaultValue: defaultAppName });

    this.set('log.level', { allowedValues: logLevels, defaultValue: 'info' });
    this.set('log.dir', { defaultValue: 'logs' });
    this.set('log.buffer.size', { defaultValue: '10000', validateType: 'number' });

    this.set('aws.region', { defaultValue: 'ap-south-1' });
    this.set('aws.cloudwatch.log-group', { defaultValue: defaultAppName });
    this.set('aws.cloudwatch.log-stream', { defaultValue: defaultAppName });
    this.set('aws.cloudwatch.upload-rate', { defaultValue: '2000', validateType: 'number' });
  }

  protected set(name: keyof Configs, opts: ConfigOptions = {}): void {
    if (this.cache.has(name)) return;
    const envKey = opts.envKey ?? (name as string).toUpperCase().replace(/[.-]/g, '_');
    let value = process.env[envKey]?.trim();
    if (!value) {
      if (this.isProd() && opts.isProdRequired) Utils.exit(`Environment Variable '${envKey}' not set`);
      else if (opts.defaultValue) value = opts.defaultValue;
    }
    if (!value) return;

    if (opts.allowedValues && !opts.allowedValues.includes(value)) {
      const allowedValues = opts.allowedValues.map(val => `'${val}'`).join(', ');
      Utils.exit(`Environment Variable '${envKey}' is invalid, must be one of [${allowedValues}]`);
    }
    if (opts.validator && !opts.validator(value)) Utils.exit(`Environment Variable '${envKey}' is invalid, validator failed`);
    if (!opts.validateType) {
      this.cache.set(name, opts.transform ? opts.transform(value) : value);
      return;
    }

    let typedValue: number | boolean;
    if (opts.validateType === 'number') {
      typedValue = Number(value);
      if (isNaN(typedValue)) Utils.exit(`Environment Variable '${envKey}' is invalid, must be a number`);
    } else {
      if (!['true', 'false'].includes(value)) Utils.exit(`Environment Variable '${envKey}' is invalid, must be a boolean`);
      typedValue = value === 'true';
    }
    this.cache.set(name, typedValue);
  }

  isProd(): boolean {
    return this.cache.get('app.env') === 'production';
  }

  isDev(): boolean {
    return this.cache.get('app.env') === 'development';
  }

  isTest(): boolean {
    return this.cache.get('app.env') === 'test';
  }

  get<T extends keyof Configs>(key: T): Configs[T] {
    return this.cache.get(key);
  }

  getOrThrow<T extends keyof Configs>(key: T): Exclude<Configs[T], null> {
    const value = this.cache.get(key);
    if (value == null) throw new Error(`Expected config value for '${key.toString()}' to be set`);
    return value;
  }
}

const globalRef = global as any;
export const Config: ConfigService = globalRef.configService || (globalRef.configService = new ConfigService());
