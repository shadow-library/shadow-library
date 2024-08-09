/**
 * Importing npm packages
 */
import { describe, expect, it } from '@jest/globals';

/**
 * Importing user defined packages
 */
import { Response } from '@shadow-library/server';

import { Utils } from '../utils';

/**
 * Defining types
 */

/**
 * Declaring the constants
 */

describe('Response', () => {
  let response: Response;

  it('should create a new instance', () => {
    const rawRes = Utils.getMockedResponse();
    response = new Response(rawRes);
    expect(response).toBeInstanceOf(Response);
  });

  it('should set the status code', () => {
    response.setStatusCode(200);
    expect(response.raw.statusCode).toBe(200);
  });

  it('should set header', () => {
    const key = 'Authorization';
    const value = 'Bearer token';
    response.setHeader(key, value);
    expect(response.raw.getHeader(key)).toBe(value);
  });

  it('should set cookie', () => {
    response.setCookie('uid', '123');
    const cookieOne = response.raw.getHeader('Set-Cookie');

    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    response.setCookie('uid', '123', { maxAge: 60, httpOnly: true });
    const cookieTwo = response.raw.getHeader('Set-Cookie');

    expect(cookieOne).toBe('uid=123; Path=/');
    expect(cookieTwo).toBe(`uid=123; Path=/; Expires=${now.toUTCString()}; HttpOnly`);
  });

  it('should clear cookie', () => {
    response.clearCookie('uid');
    const cookie = response.raw.getHeader('Set-Cookie');

    expect(cookie).toBe('uid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT');
  });

  it('should set send the response', () => {
    const data = { message: 'Hello' };
    response.send('application/json', JSON.stringify(data));

    expect(response.raw.getHeader('Content-Type')).toBe('application/json');
    expect(response.raw.getHeader('Content-Length')).toBe(19);
  });

  it('should check if response is sent', () => {
    expect(response.isSent()).toBe(true);
  });
});
