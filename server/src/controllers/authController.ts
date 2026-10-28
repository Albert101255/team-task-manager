import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { loginSchema, registerSchema } from '../validation/auth.js';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/jwt.js';

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email: validated.email });
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address already exists.',
        },
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(validated.password, salt);

    // Enforce role: 'member' strictly. Public registration CANNOT create admin.
    const user = await User.create({
      name: validated.name,
      email: validated.email,
      passwordHash,
      role: 'member',
    });

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      data: {
        message: 'Account registered successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validated.email });
    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const isMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        },
      });
      return;
    }

    const token = signToken({
      userId: user._id.toString(),
      role: user.role,
      email: user.email,
    });

    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      data: {
        message: 'Signed in successfully',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookie(res);
  res.status(200).json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
      },
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    },
  });
}
