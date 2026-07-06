import { config } from '../config/env';

/**
 * Set the JWT as an HttpOnly cookie on the response.
 */
export function setAuthCookie(res: import('express').Response, token: string) {
  res.cookie(config.cookie.name, token, {
    httpOnly: config.cookie.httpOnly,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    maxAge: config.cookie.maxAge,
    path: '/',
    ...(config.cookie.domain ? { domain: config.cookie.domain } : {}),
  });
}

/**
 * Clear the auth cookie (logout).
 */
export function clearAuthCookie(res: import('express').Response) {
  res.clearCookie(config.cookie.name, { path: '/' });
}
