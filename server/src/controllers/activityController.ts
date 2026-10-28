import { Request, Response, NextFunction } from 'express';
import { ActivityLog } from '../models/ActivityLog.js';

export async function getTaskActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;

    const activities = await ActivityLog.find({ taskId: id })
      .populate('performedBy', '_id name email role')
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAllActivities(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 30));

    const activities = await ActivityLog.find()
      .populate('performedBy', '_id name email role')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      data: {
        activities,
      },
    });
  } catch (error) {
    next(error);
  }
}
