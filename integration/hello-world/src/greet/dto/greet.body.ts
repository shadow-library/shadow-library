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
export class GreetBody {
  @Field({
    pattern: '^[a-zA-Z ]{3,32}$',
  })
  name: string;

  @Field({
    enum: ['M', 'F', 'U'],
    default: 'U',
    required: false,
  })
  gender?: string;
}
