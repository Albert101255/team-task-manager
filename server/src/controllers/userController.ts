import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.js';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const roleFilter = req.query.role as string;
    const query: any = {};
    if (roleFilter && ['admin', 'member'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    const users = await User.find(query)
      .select('_id name email role createdAt updatedAt')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: {
        users,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getCurrentUserProfile(req: Request, res: Response): Promise<void> {
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
