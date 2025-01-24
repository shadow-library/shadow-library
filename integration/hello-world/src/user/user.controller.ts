/**
 * Importing npm packages
 */
import { Get, HttpController, Params, RespondFor } from '@shadow-library/fastify';

/**
 * Importing user defined packages
 */
import { LookUpResponse, UserResponse } from './user.dto';
import { UserGuard } from './user.guard';
import { UserService } from './user.service';

/**
 * Defining types
 */

interface GetUserParams {
  id: string;
}

interface LookUpParams {
  name: string;
}

/**
 * Declaring the constants
 */

@HttpController('/users')
@UserGuard(true, true)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  @RespondFor(200, UserResponse)
  async getUser(@Params() params: GetUserParams): Promise<UserResponse> {
    return this.userService.getUser(params.id, true);
  }

  @Get()
  @RespondFor(200, [UserResponse])
  async getUsers(): Promise<UserResponse[]> {
    return this.userService.getUsers();
  }

  @Get('/lookup/:name')
  @UserGuard(false)
  @RespondFor(200, LookUpResponse)
  lookupUser(@Params() params: LookUpParams): LookUpResponse {
    return { exists: !!this.userService.getUserByName(params.name) };
  }
}
