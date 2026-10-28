import { z } from 'zod';
import mongoose from 'mongoose';

const objectIdValidator = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ID format',
});

export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters'),
  description: z.string().trim().max(5000, 'Description must not exceed 5000 characters').optional().default(''),
  assignedTo: objectIdValidator,
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid due date format',
  }),
  status: z.enum(['todo', 'in_progress', 'completed']).optional().default('todo'),
});

export const updateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must not exceed 200 characters')
    .optional(),
  description: z.string().trim().max(5000, 'Description must not exceed 5000 characters').optional(),
  assignedTo: objectIdValidator.optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid due date format',
    })
    .optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'completed'], {
    required_error: 'Status is required',
    invalid_type_error: 'Status must be one of todo, in_progress, completed',
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
