import mongoose, { Document, Schema, Types } from 'mongoose';

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface ITask extends Document {
  title: string;
  description: string;
  assignedTo: Types.ObjectId;
  createdBy: Types.ObjectId;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 200,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 5000,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'completed'],
      default: 'todo',
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

TaskSchema.index({ assignedTo: 1, status: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
