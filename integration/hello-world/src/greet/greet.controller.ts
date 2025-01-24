/**
 * Importing npm packages
 */
import { Body, Get, HttpController, Post, RespondFor } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { GreetBody, GreetResponse } from './dto';
import { GreetService } from './greet.service';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@HttpController('/greet')
export class GreetController {
  constructor(private readonly helloService: GreetService) {}

  @Get('/sync')
  sync(): GreetResponse {
    const msg = this.helloService.sayHello('World');
    return { msg };
  }

  @Post('/async')
  @RespondFor(200, GreetResponse)
  async async(@Body() body: GreetBody): Promise<GreetResponse> {
    await Bun.sleep(100);
    const msg = this.helloService.sayHello(body.name, body.gender);
    return { msg };
  }
}
