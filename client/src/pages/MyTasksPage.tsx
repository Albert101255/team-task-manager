import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { PriorityBadge } from '../components/PriorityBadge';
import { DueDateBadge } from '../components/DueDateBadge';
import { TaskFilters } from '../components/TaskFilters';
import { EmptyState } from '../components/EmptyState';
import { TaskStatus } from '../types';

export const MyTasksPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const status = searchParams.get('status') || '';
  const priority = searchParams.get('priority') || '';
  const search = searchParams.get('search') || '';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const { data: tasksData, isLoading } = useQuery({
    queryKey: ['my-tasks', status, priority, search],
    queryFn: () =>
      api.getMyTasks({
        status: status || undefined,
        priority: priority || undefined,
        search: search || undefined,
      }),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTaskStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });

  const tasks = tasksData?.tasks || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">My Tasks</h1>
        <p className="mt-1 text-sm text-slate-500">
          All tasks assigned to you. You can update your task status as you make progress.
        </p>
      </div>

      {/* Filters */}
      <TaskFilters
        status={status}
        setStatus={(val) => updateFilter('status', val)}
        priority={priority}
        setPriority={(val) => updateFilter('priority', val)}
        search={search}
        setSearch={(val) => updateFilter('search', val)}
        showMemberFilter={false}
        onClear={handleClearFilters}
      />

      {/* Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading your tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No tasks found"
              description="You have no tasks matching the selected filters."
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
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
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
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
