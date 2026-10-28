import mongoose, { Document, Schema, Types } from 'mongoose';

export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_REASSIGNED'
  | 'TASK_UPDATED'
  | 'STATUS_CHANGED'
  | 'TASK_DELETED';

export interface IActivityLog extends Document {
  taskId: string;
  performedBy: Types.ObjectId;
  action: ActivityAction;
  oldValue?: string;
  newValue?: string;
  createdAt: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>(
  {
    taskId: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    action: {
      type: String,
      enum: [
        'TASK_CREATED',
        'TASK_ASSIGNED',
        'TASK_REASSIGNED',
        'TASK_UPDATED',
        'STATUS_CHANGED',
        'TASK_DELETED',
      ],
      required: true,
      index: true,
    },
    oldValue: {
      type: String,
      default: null,
    },
    newValue: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

ActivityLogSchema.index({ taskId: 1, createdAt: -1 });

export const ActivityLog = mongoose.model<IActivityLog>('ActivityLog', ActivityLogSchema);
