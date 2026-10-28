import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit3, ArrowLeft, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { DueDateBadge } from '../components/DueDateBadge';
import { TaskFilters } from '../components/TaskFilters';
import { ConfirmModal } from '../components/ConfirmModal';
import { EmptyState } from '../components/EmptyState';

export const AllTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const assignedTo = searchParams.get('assignedTo') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  const [taskToDelete, setTaskToDelete] = useState<{ id: string; title: string } | null>(null);

  // Update query params helper
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  // Fetch team members for assignment filter
  const { data: membersData } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => api.getUsers('member'),
  });

  // Fetch tasks
  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['all-tasks', status, priority, assignedTo, search, page],
    queryFn: () =>
      api.getTasks({
        status: status || undefined,
        priority: priority || undefined,
        assignedTo: assignedTo || undefined,
        search: search || undefined,
        page,
        limit: 15,
      }),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setTaskToDelete(null);
    },
  });

  const tasks = tasksData?.tasks || [];
  const pagination = tasksData?.pagination;
  const members = membersData?.users || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">All Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            View, filter, and manage tasks across all team members.
          </p>
        </div>
        <Link
          to="/tasks/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create task
        </Link>
      </div>

      {/* Filters */}
      <TaskFilters
        status={status}
        setStatus={(val) => updateFilter('status', val)}
        priority={priority}
        setPriority={(val) => updateFilter('priority', val)}
        assignedTo={assignedTo}
        setAssignedTo={(val) => updateFilter('assignedTo', val)}
        search={search}
        setSearch={(val) => updateFilter('search', val)}
        members={members}
        showMemberFilter
        onClear={handleClearFilters}
      />

      {/* Tasks Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tasks found"
              description="No tasks match the active filters or search criteria."
              action={{
                label: 'Clear Filters',
                onClick: handleClearFilters,
              }}
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
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/75 transition-colors">
                    <td className="py-3.5 px-4 max-w-md">
                      <Link
                        to={`/tasks/${task._id}`}
                        className="font-medium text-slate-900 hover:text-blue-600 block line-clamp-1"
                      >
                        {task.title}
                      </Link>
                      {task.description && (
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-1">
                          {task.description}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-700 whitespace-nowrap">
                      {task.assignedTo?.name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={task.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <DueDateBadge dueDate={task.dueDate} status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/tasks/${task._id}`}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded hover:bg-slate-100"
                          title="Edit Task"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setTaskToDelete({ id: task._id, title: task.title })}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                          title="Delete Task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination && pagination.totalPages > 1 && (
          <div className="bg-slate-50/50 px-4 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <span className="font-semibold">{pagination.page}</span> of{' '}
              <span className="font-semibold">{pagination.totalPages}</span> ({pagination.total}{' '}
              tasks)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', (pagination.page - 1).toString())}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => updateFilter('page', (pagination.page + 1).toString())}
                className="p-1.5 rounded border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
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
