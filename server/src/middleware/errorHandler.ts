import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { env } from '../config/env.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const firstIssue = err.issues[0];
    const message = firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Validation error';
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: err.issues,
      },
    });
    return;
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: `Invalid format for field: ${err.path}`,
      },
    });
    return;
  }

  // Handle Mongo duplicate key errors (code 11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    res.status(409).json({
      success: false,
      error: {
        code: 'CONFLICT',
        message: `An account with this ${field} already exists.`,
      },
    });
    return;
  }

  // Default server error
  const statusCode = err.statusCode || 500;
  const message =
    env.NODE_ENV === 'production' && statusCode === 500
      ? 'An unexpected internal server error occurred.'
      : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
  });
}
