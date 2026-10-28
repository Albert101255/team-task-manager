import jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import { env } from '../config/env.js';
import { UserRole } from '../models/User.js';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export const AUTH_COOKIE_NAME = 'ttm_auth_token';

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}

export function getCookieOptions(): CookieOptions {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(AUTH_COOKIE_NAME, token, getCookieOptions());
}

export function clearAuthCookie(res: Response): void {
  const isProduction = env.NODE_ENV === 'production';
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
  });
}
