/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export type NonNullJSONData = string | number | boolean | JSONData[] | { [key: string]: NonNullJSONData };

export type JSONData = string | number | boolean | null | JSONData[] | { [key: string]: JSONData };
