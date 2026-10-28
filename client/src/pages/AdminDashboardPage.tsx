import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderGit2,
  ExternalLink,
  Trash2,
  Activity as ActivityIcon,
} from 'lucide-react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { DueDateBadge } from '../components/DueDateBadge';
import { ActivityList } from '../components/ActivityList';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

export const AdminDashboardPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  // Queries
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['recent-tasks'],
    queryFn: () => api.getTasks({ limit: 6 }),
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: () => api.getAllActivities(8),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
      setTaskToDelete(null);
    },
  });

  const stats = statsData?.stats;
  const recentTasks = tasksData?.tasks || [];
  const activities = activityData?.activities || [];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Overview</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track team assignments, workload metrics, and recent activity.
          </p>
        </div>
        <div>
          <Link
            to="/tasks/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create task
          </Link>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tasks"
          value={statsLoading ? '...' : stats?.totalTasks ?? 0}
          icon={FolderGit2}
          subtitle={`${stats?.totalMembers ?? 0} team members`}
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

      {/* Main Grid: Recent Tasks & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tasks Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">
              Recent Tasks
            </h2>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
            >
              View all tasks
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {tasksLoading ? (
              <div className="p-8 text-center text-sm text-slate-400">Loading tasks...</div>
            ) : recentTasks.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No tasks created yet"
                  description="Create the first task to begin assigning work to team members."
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Task</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentTasks.map((task) => (
                      <tr key={task._id} className="hover:bg-slate-50/75 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            to={`/tasks/${task._id}`}
                            className="font-medium text-slate-900 hover:text-blue-600 block line-clamp-1"
                          >
                            {task.title}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-xs whitespace-nowrap">
                          {task.assignedTo?.name || 'Unassigned'}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <PriorityBadge priority={task.priority} />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <StatusBadge status={task.status} size="sm" />
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <DueDateBadge dueDate={task.dueDate} status={task.status} />
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              to={`/tasks/${task._id}`}
                              className="text-xs font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded hover:bg-slate-100"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setTaskToDelete({ id: task._id, title: task.title })}
                              className="text-xs text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50"
                              title="Delete task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <ActivityIcon className="w-4 h-4 text-slate-500" />
              Recent Activity
            </h2>
            <Link
              to="/activity"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Full log
            </Link>
          </div>

          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
            {activityLoading ? (
              <div className="p-4 text-center text-xs text-slate-400">Loading activity...</div>
            ) : (
              <ActivityList activities={activities} />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This action permanently removes the task and its history.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => {
          if (taskToDelete) deleteMutation.mutate(taskToDelete.id);
        }}
        onCancel={() => setTaskToDelete(null)}
      />
    </div>
  );
};
