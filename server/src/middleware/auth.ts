import { Request, Response, NextFunction } from 'express';
import { AUTH_COOKIE_NAME, verifyToken } from '../utils/jwt.js';
import { IUser, User } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token = req.cookies?.[AUTH_COOKIE_NAME];

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please sign in.',
        },
      });
      return;
    }

    const payload = verifyToken(token);
    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User session is invalid or user no longer exists.',
        },
      });
      return;
    }

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired session token.',
      },
    });
  }
}
