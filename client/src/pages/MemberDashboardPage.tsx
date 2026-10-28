import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Clock, AlertCircle, ListTodo } from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { PriorityBadge } from '../components/PriorityBadge';
import { DueDateBadge } from '../components/DueDateBadge';
import { EmptyState } from '../components/EmptyState';
import { TaskStatus } from '../types';

export const MemberDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: () => api.getMyTasks(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const stats = statsData?.stats;
  const myTasks = tasksData?.tasks || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">My Workspace</h1>
        <p className="mt-1 text-sm text-slate-500">
          Review your assigned tasks, update progress statuses, and meet deadlines.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Assigned Tasks"
          value={statsLoading ? '...' : stats?.totalTasks ?? 0}
          icon={ListTodo}
        />
        <StatCard
          label="In Progress"
          value={statsLoading ? '...' : stats?.inProgressTasks ?? 0}
          icon={Clock}
          variant="default"
        />
        <StatCard
          label="Completed"
          value={statsLoading ? '...' : stats?.completedTasks ?? 0}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          label="Overdue"
          value={statsLoading ? '...' : stats?.overdueTasks ?? 0}
          icon={AlertCircle}
          variant={stats?.overdueTasks ? 'warning' : 'default'}
        />
      </div>

      {/* Assigned Tasks Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
            Assigned Workload
          </h2>
          <span className="text-xs text-slate-500 font-medium">
            {myTasks.length} {myTasks.length === 1 ? 'task' : 'tasks'}
          </span>
        </div>

        {tasksLoading ? (
          <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-sm text-slate-400">
            Loading your tasks...
          </div>
        ) : myTasks.length === 0 ? (
          <EmptyState
            title="No tasks assigned yet"
            description="You do not have any tasks assigned to your workspace currently."
          />
        ) : (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">View</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myTasks.map((task) => (
                    <tr key={task._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3.5 px-4 max-w-md">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="font-medium text-slate-900 hover:text-blue-600 block"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <PriorityBadge priority={task.priority} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <DueDateBadge dueDate={task.dueDate} status={task.status} />
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          disabled={updateStatusMutation.isPending}
                          onChange={(e) =>
                            updateStatusMutation.mutate({
                              id: task._id,
                              status: e.target.value as TaskStatus,
                            })
                          }
                          className="text-xs font-medium py-1 px-2.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          Details &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
