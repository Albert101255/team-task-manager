import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export const CreateTaskPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('todo');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Fetch available members for assignment
  const { data: membersData, isLoading: membersLoading } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => api.getUsers('member'),
  });

  const members = membersData?.users || [];

  const createMutation = useMutation({
    mutationFn: (taskData: {
      title: string;
      description?: string;
      assignedTo: string;
      priority: string;
      dueDate: string;
      status: string;
    }) => api.createTask(taskData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['recent-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['recent-activities'] });
      navigate(`/tasks/${data.task._id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create task.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || title.length < 3) {
      setError('Title must be at least 3 characters long.');
      return;
    }

    if (!assignedTo) {
      setError('Please select a team member to assign this task to.');
      return;
    }

    if (!dueDate) {
      setError('Please specify a valid due date.');
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      priority,
      dueDate,
      status,
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/tasks"
          className="p-1.5 text-slate-500 hover:text-slate-800 rounded hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Task</h1>
          <p className="text-xs text-slate-500">
            Assign work to a team member with priority and deadlines.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        {error && (
          <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-xs font-semibold text-slate-700">
              Task Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Audit API authentication middleware"
              className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-slate-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe requirements, acceptance criteria, or technical details..."
              className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="assignedTo" className="block text-xs font-semibold text-slate-700">
                Assigned Member <span className="text-rose-500">*</span>
              </label>
              <select
                id="assignedTo"
                required
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={membersLoading}
                className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="">Select a member...</option>
                {members.map((m) => (
                  <option key={m.id || m._id} value={m.id || m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-xs font-semibold text-slate-700">
                Due Date <span className="text-rose-500">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-xs font-semibold text-slate-700">
                Priority
              </label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-xs font-semibold text-slate-700">
                Initial Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <Link
              to="/tasks"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {createMutation.isPending ? 'Saving...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
