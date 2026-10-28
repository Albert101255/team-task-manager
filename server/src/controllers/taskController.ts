import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Task, TaskPriority, TaskStatus } from '../models/Task.js';
import { User } from '../models/User.js';
import { logActivity } from '../services/activityService.js';
import {
  createTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from '../validation/task.js';

export async function getAllTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, priority, assignedTo, search, page = '1', limit = '50' } = req.query;

    const query: any = {};

    if (status && ['todo', 'in_progress', 'completed'].includes(status as string)) {
      query.status = status;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority as string)) {
      query.priority = priority;
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo as string)) {
      query.assignedTo = assignedTo;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', '_id name email role')
        .populate('createdBy', '_id name email role')
        .sort({ dueDate: 1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Task.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!._id;
    const { status, priority, search } = req.query;

    const query: any = { assignedTo: userId };

    if (status && ['todo', 'in_progress', 'completed'].includes(status as string)) {
      query.status = status;
    }

    if (priority && ['low', 'medium', 'high'].includes(priority as string)) {
      query.priority = priority;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', '_id name email role')
      .populate('createdBy', '_id name email role')
      .sort({ dueDate: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        tasks,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', '_id name email role')
      .populate('createdBy', '_id name email role');

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

    res.status(200).json({
      success: true,
      data: {
        task,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = createTaskSchema.parse(req.body);

    // Verify assigned member exists and is a member
    const assignee = await User.findById(validated.assignedTo);
    if (!assignee) {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Assigned member does not exist',
        },
      });
      return;
    }

    if (assignee.role !== 'member') {
      res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Tasks can only be assigned to users with the member role',
        },
      });
      return;
    }

    const task = await Task.create({
      title: validated.title,
      description: validated.description,
      assignedTo: assignee._id,
      createdBy: req.user!._id,
      priority: validated.priority as TaskPriority,
      status: (validated.status || 'todo') as TaskStatus,
      dueDate: new Date(validated.dueDate),
    });

    // Record activity logs
    await logActivity({
      taskId: task._id,
      performedBy: req.user!._id,
      action: 'TASK_CREATED',
      newValue: task.title,
    });

    await logActivity({
      taskId: task._id,
      performedBy: req.user!._id,
      action: 'TASK_ASSIGNED',
      newValue: assignee.name,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', '_id name email role')
      .populate('createdBy', '_id name email role');

    res.status(201).json({
      success: true,
      data: {
        message: 'Task created successfully',
        task: populatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const validated = updateTaskSchema.parse(req.body);
    const { id } = req.params;

    const task = await Task.findById(id).populate('assignedTo', 'name');
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

    let assigneeChanged = false;
    let oldAssigneeName = (task.assignedTo as any)?.name || '';
    let newAssigneeName = '';

    if (validated.assignedTo && validated.assignedTo !== task.assignedTo._id.toString()) {
      const newAssignee = await User.findById(validated.assignedTo);
      if (!newAssignee) {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'New assignee does not exist',
          },
        });
        return;
      }
      if (newAssignee.role !== 'member') {
        res.status(400).json({
          success: false,
          error: {
            code: 'BAD_REQUEST',
            message: 'Tasks can only be assigned to users with the member role',
          },
        });
        return;
      }
      assigneeChanged = true;
      newAssigneeName = newAssignee.name;
      task.assignedTo = newAssignee._id;
    }

    const oldStatus = task.status;
    let statusChanged = false;
    if (validated.status && validated.status !== oldStatus) {
      statusChanged = true;
      task.status = validated.status as TaskStatus;
    }

    if (validated.title !== undefined) task.title = validated.title;
    if (validated.description !== undefined) task.description = validated.description;
    if (validated.priority !== undefined) task.priority = validated.priority as TaskPriority;
    if (validated.dueDate !== undefined) task.dueDate = new Date(validated.dueDate);

    await task.save();

    if (assigneeChanged) {
      await logActivity({
        taskId: task._id,
        performedBy: req.user!._id,
        action: 'TASK_REASSIGNED',
        oldValue: oldAssigneeName,
        newValue: newAssigneeName,
      });
    }

    if (statusChanged) {
      await logActivity({
        taskId: task._id,
        performedBy: req.user!._id,
        action: 'STATUS_CHANGED',
        oldValue: oldStatus,
        newValue: task.status,
      });
    }

    if (!assigneeChanged && !statusChanged) {
      await logActivity({
        taskId: task._id,
        performedBy: req.user!._id,
        action: 'TASK_UPDATED',
        newValue: 'Updated task details',
      });
    }

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', '_id name email role')
      .populate('createdBy', '_id name email role');

    res.status(200).json({
      success: true,
      data: {
        message: 'Task updated successfully',
        task: updatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Strictly validate only status to prevent mass-assignment
    const { status } = updateTaskStatusSchema.parse(req.body);
    const { id } = req.params;

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

    const oldStatus = task.status;
    if (oldStatus !== status) {
      task.status = status;
      await task.save();

      await logActivity({
        taskId: task._id,
        performedBy: req.user!._id,
        action: 'STATUS_CHANGED',
        oldValue: oldStatus,
        newValue: status,
      });
    }

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', '_id name email role')
      .populate('createdBy', '_id name email role');

    res.status(200).json({
      success: true,
      data: {
        message: 'Task status updated successfully',
        task: populatedTask,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
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

    await logActivity({
      taskId: task._id,
      performedBy: req.user!._id,
      action: 'TASK_DELETED',
      oldValue: task.title,
    });

    await Task.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      data: {
        message: 'Task deleted successfully',
      },
    });
  } catch (error) {
    next(error);
  }
}
