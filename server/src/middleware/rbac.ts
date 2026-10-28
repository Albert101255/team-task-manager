import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ITask, Task } from '../models/Task.js';
import { UserRole } from '../models/User.js';

declare global {
  namespace Express {
    interface Request {
      task?: ITask;
    }
  }
}

export function requireRole(allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to perform this action. Administrator privileges required.',
        },
      });
      return;
    }

    next();
  };
}

export async function requireAdminOrAssignee(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
    return;
  }

  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'Invalid task ID format',
      },
    });
    return;
  }

  try {
    const task = await Task.findById(id);

    if (!task) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Task not found',
        },
      });
      return;
    }

    const isAdmin = req.user.role === 'admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssignee) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'You are not authorized to access or modify this task.',
        },
      });
      return;
    }

    req.task = task;
    next();
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to authorize task access',
      },
    });
  }
}
