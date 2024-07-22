/**
 * Importing npm packages
 */

/**
 * Importing user defined packages
 */

/**
 * Defining types
 */

export interface PageCursor {
  limit: number;
  offset: number;
}

export interface PageInfo {
  page: number;
  size: number;
}

export interface PageSort<T> {
  field: T;
  order: 'asc' | 'desc';
}

export interface PageResult<T> {
  total: number;
  items: T[];
}

export interface PageCursorResult<T> extends PageCursor, PageResult<T> {}

export interface PageInfoResult<T> extends PageInfo, PageResult<T> {}
