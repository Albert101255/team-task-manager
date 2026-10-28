import { Request, Response, NextFunction } from 'express';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';

export async function getDashboardStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user!;
    const isAdmin = user.role === 'admin';
    const now = new Date();

    const baseFilter: any = isAdmin ? {} : { assignedTo: user._id };

    const [totalTasks, inProgressTasks, completedTasks, overdueTasks, totalMembers] =
      await Promise.all([
        Task.countDocuments(baseFilter),
        Task.countDocuments({ ...baseFilter, status: 'in_progress' }),
        Task.countDocuments({ ...baseFilter, status: 'completed' }),
        Task.countDocuments({
          ...baseFilter,
          status: { $ne: 'completed' },
          dueDate: { $lt: now },
        }),
        isAdmin ? User.countDocuments({ role: 'member' }) : Promise.resolve(0),
      ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalTasks,
          inProgressTasks,
          completedTasks,
          overdueTasks,
          ...(isAdmin && { totalMembers }),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}
