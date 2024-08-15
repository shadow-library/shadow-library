/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Request } from '@shadow-library/server';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */
const postURL = '/api/v1/users/123';
const getURL = '/api/v1/users?name=test';
const data = { username: 'test', password: 'Password@123' };

describe('Request', () => {
  let getReq: Request;
  let postReq: Request;

  it('should create a new instance', () => {
    const rawReq = Utils.getMockedRequest('POST', postURL, { cookie: 'uid=123456789' });
    const rawGetReq = Utils.getMockedRequest('GET', getURL);
    getReq = new Request(rawGetReq, undefined, undefined, { name: 'test' });
    postReq = new Request(rawReq, Buffer.from(JSON.stringify(data)), { id: '123' });

    expect(getReq).toBeInstanceOf(Request);
    expect(postReq).toBeInstanceOf(Request);
  });

  it('should parse the method', () => {
    expect(postReq.method).toBe('POST');
    expect(getReq.method).toBe('GET');
  });

  it('should parse the url', () => {
    expect(postReq.url).toBe(postURL);
    expect(getReq.url).toBe(getURL);

    expect(postReq.path).toBe('/api/v1/users/123');
    expect(getReq.path).toBe('/api/v1/users');
  });

  it('should parse the query', () => {
    expect(getReq.body).toBeUndefined();
    expect(getReq.rawBody).toHaveLength(0);
    expect(getReq.query?.name).toBe('test');

    expect(postReq.body).toBeUndefined();
  });

  it('should parse the body', () => {
    postReq.parseBody();

    expect(postReq.body).toStrictEqual(data);
  });

  it('should return the headers', () => {
    expect(postReq.hasHeader('host')).toBe(true);
    expect(postReq.hasHeader('accept')).toBe(true);
    expect(postReq.hasHeader('accept-language')).toBe(true);

    expect(postReq.getHeader('user-agent')).toBe('Jest');
    expect(postReq.getHeader('connection')).toBe('keep-alive');
    expect(postReq.getHeader('accept-encoding')).toBe('gzip, deflate, br, zstd');
  });

  it('should parse the cookies', () => {
    expect(getReq.cookies).toStrictEqual({});
    expect(postReq.cookies).toStrictEqual({ uid: '123456789' });
  });
});
