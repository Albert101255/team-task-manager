import mongoose from 'mongoose';
import { ActivityAction, ActivityLog, IActivityLog } from '../models/ActivityLog.js';

interface LogActivityParams {
  taskId: mongoose.Types.ObjectId | string;
  performedBy: mongoose.Types.ObjectId | string;
  action: ActivityAction;
  oldValue?: string;
  newValue?: string;
}

export async function logActivity(params: LogActivityParams): Promise<IActivityLog> {
  try {
    const log = await ActivityLog.create({
      taskId: params.taskId.toString(),
      performedBy: new mongoose.Types.ObjectId(params.performedBy),
      action: params.action,
      oldValue: params.oldValue,
      newValue: params.newValue,
    });
    return log;
  } catch (error) {
    console.error('[ActivityLog] Failed to record activity log:', error);
    throw error;
  }
}
