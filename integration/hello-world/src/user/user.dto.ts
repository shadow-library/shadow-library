/**
 * Importing npm packages
 */

import { Field, Schema } from '@shadow-library/class-schema';

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

@Schema()
export class UserResponse {
  @Field()
  id: number;

  @Field()
  name: string;

  @Field({ required: false })
  admin?: boolean;
}

@Schema()
export class LookUpResponse {
  @Field()
  exists: boolean;
}
