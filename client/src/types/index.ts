export type UserRole = 'admin' | 'member';

export interface User {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  _id: string;
  title: string;
  description: string;
  assignedTo: User;
  createdBy: User;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction =
  | 'TASK_CREATED'
  | 'TASK_ASSIGNED'
  | 'TASK_REASSIGNED'
  | 'TASK_UPDATED'
  | 'STATUS_CHANGED'
  | 'TASK_DELETED';

export interface ActivityLog {
  _id: string;
  taskId: string;
  performedBy: User;
  action: ActivityAction;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalMembers?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
