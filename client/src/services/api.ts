import { ApiResponse, DashboardStats, Task, User, ActivityLog } from '../types';

export class ApiError extends Error {
  code: string;
  details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  let data: ApiResponse<T>;
  try {
    data = await response.json();
  } catch {
    throw new ApiError('Unexpected response from server', 'INVALID_RESPONSE');
  }

  if (!response.ok || !data.success) {
    throw new ApiError(
      data.error?.message || 'A network or server error occurred',
      data.error?.code || 'SERVER_ERROR',
      data.error?.details
    );
  }

  return data.data as T;
}

export const api = {
  // Auth
  async login(credentials: { email: string; password: string }) {
    return request<{ message: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  async register(data: { name: string; email: string; password: string; confirmPassword: string }) {
    return request<{ message: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async logout() {
    return request<{ message: string }>('/api/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return request<{ user: User }>('/api/auth/me');
  },

  // Users
  async getUsers(role?: string) {
    const query = role ? `?role=${role}` : '';
    return request<{ users: User[] }>(`/api/users${query}`);
  },

  // Tasks
  async getTasks(params?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.assignedTo) searchParams.set('assignedTo', params.assignedTo);
    if (params?.search) searchParams.set('search', params.search);
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{
      tasks: Task[];
      pagination?: { total: number; page: number; limit: number; totalPages: number };
    }>(`/api/tasks${query}`);
  },

  async getMyTasks(params?: { status?: string; priority?: string; search?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.priority) searchParams.set('priority', params.priority);
    if (params?.search) searchParams.set('search', params.search);

    const query = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<{ tasks: Task[] }>(`/api/tasks/my${query}`);
  },

  async getTaskById(id: string) {
    return request<{ task: Task }>(`/api/tasks/${id}`);
  },

  async createTask(taskData: {
    title: string;
    description?: string;
    assignedTo: string;
    priority: string;
    dueDate: string;
    status?: string;
  }) {
    return request<{ message: string; task: Task }>('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  async updateTask(
    id: string,
    updates: {
      title?: string;
      description?: string;
      assignedTo?: string;
      priority?: string;
      dueDate?: string;
      status?: string;
    }
  ) {
    return request<{ message: string; task: Task }>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  async updateTaskStatus(id: string, status: string) {
    return request<{ message: string; task: Task }>(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteTask(id: string) {
    return request<{ message: string }>(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  },

  // Activity
  async getTaskActivity(taskId: string) {
    return request<{ activities: ActivityLog[] }>(`/api/activity/tasks/${taskId}`);
  },

  async getAllActivities(limit: number = 30) {
    return request<{ activities: ActivityLog[] }>(`/api/activity?limit=${limit}`);
  },

  // Dashboard
  async getDashboardStats() {
    return request<{ stats: DashboardStats }>('/api/dashboard/stats');
  },
};
