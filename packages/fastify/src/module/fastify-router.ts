/**
 * Importing npm packages
 */
import { Inject, Injectable, Router } from '@shadow-library/app';
import { Logger, utils } from '@shadow-library/common';
import { type FastifyInstance } from 'fastify';

/**
 * Importing user defined packages
 */
import { FASTIFY_CONFIG, FASTIFY_INSTANCE } from '../constants';
import { type FastifyConfig } from './fastify-module.interface';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Injectable()
export class FastifyRouter extends Router {
  private readonly logger = Logger.getLogger(FastifyRouter.name);

  constructor(
    @Inject(FASTIFY_CONFIG) private readonly config: FastifyConfig,
    @Inject(FASTIFY_INSTANCE) private readonly instance: FastifyInstance,
  ) {
    super();
  }

  register(): void {}

  async start(): Promise<void> {
    const options = utils.object.pickKeys(this.config, ['port', 'host']);
    const address = await this.instance.listen(options);
    this.logger.info(`server started at ${address}`);
  }

  async stop(): Promise<void> {
    this.logger.info('stopping server');
    await this.instance.close();
  }
}
