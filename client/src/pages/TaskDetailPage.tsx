import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Trash2,
  Calendar,
  User as UserIcon,
  Shield,
  Clock,
  Save,
  AlertCircle,
  History,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { DueDateBadge } from '../components/DueDateBadge';
import { ActivityList } from '../components/ActivityList';
import { ConfirmModal } from '../components/ConfirmModal';
import { TaskPriority, TaskStatus } from '../types';

export const TaskDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [dueDate, setDueDate] = useState('');

  // Fetch task
  const {
    data: taskData,
    isLoading: taskLoading,
    error: taskFetchError,
  } = useQuery({
    queryKey: ['task', id],
    queryFn: () => api.getTaskById(id!),
    enabled: Boolean(id),
  });

  // Fetch activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['task-activity', id],
    queryFn: () => api.getTaskActivity(id!),
    enabled: Boolean(id),
  });

  // Fetch members for reassign (admin only)
  const { data: membersData } = useQuery({
    queryKey: ['members-list'],
    queryFn: () => api.getUsers('member'),
    enabled: isAdmin,
  });

  const task = taskData?.task;
  const activities = activityData?.activities || [];
  const members = membersData?.users || [];

  // Sync form state when task is loaded
  React.useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setAssignedTo(task.assignedTo?._id || task.assignedTo?.id || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : '');
    }
  }, [task]);

  // Mutations
  const updateTaskMutation = useMutation({
    mutationFn: (updates: any) => api.updateTask(id!, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', id] });
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsEditing(false);
      setSuccessMessage('Task updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update task.');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (newStatus: TaskStatus) => api.updateTaskStatus(id!, newStatus),
    onSuccess: (data) => {
      setStatus(data.task.status);
      queryClient.invalidateQueries({ queryKey: ['task', id] });
      queryClient.invalidateQueries({ queryKey: ['task-activity', id] });
      queryClient.invalidateQueries({ queryKey: ['my-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setSuccessMessage('Status updated successfully.');
      setTimeout(() => setSuccessMessage(null), 3000);
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to update task status.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteTask(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      navigate(isAdmin ? '/tasks' : '/dashboard');
    },
  });

  if (taskLoading) {
    return (
      <div className="py-12 text-center text-sm text-slate-400">Loading task details...</div>
    );
  }

  if (taskFetchError || !task) {
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          Task not found or you do not have permission to access it.
        </div>
        <Link
          to={isAdmin ? '/tasks' : '/my-tasks'}
          className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to tasks
        </Link>
      </div>
    );
  }

  const handleAdminSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title.trim() || title.length < 3) {
      setFormError('Title must be at least 3 characters.');
      return;
    }

    updateTaskMutation.mutate({
      title: title.trim(),
      description: description.trim(),
      assignedTo,
      priority,
      status,
      dueDate,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={isAdmin ? '/tasks' : '/my-tasks'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isAdmin ? 'all tasks' : 'my tasks'}
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Edit Task
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsEditing(false);
                  setFormError(null);
                }}
                className="px-3 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-md hover:bg-slate-50"
              >
                Cancel Edit
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {formError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* Main Grid: Details on Left, Meta & Activity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Task Info or Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            {isEditing && isAdmin ? (
              <form onSubmit={handleAdminSave} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">Description</label>
                  <textarea
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Assigned Member
                    </label>
                    <select
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {members.map((m) => (
                        <option key={m.id || m._id} value={m.id || m._id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Due Date</label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as TaskPriority)}
                      className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as TaskStatus)}
                      className="mt-1 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                  <button
                    type="submit"
                    disabled={updateTaskMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-5">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <StatusBadge status={task.status} />
                    <PriorityBadge priority={task.priority} />
                    <DueDateBadge dueDate={task.dueDate} status={task.status} />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">{task.title}</h2>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Description
                  </h3>
                  {task.description ? (
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {task.description}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No description provided.</p>
                  )}
                </div>

                {/* Status Updater for Member or Admin */}
                <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Update Task Status</span>
                  <select
                    value={task.status}
                    disabled={updateStatusMutation.isPending}
                    onChange={(e) => updateStatusMutation.mutate(e.target.value as TaskStatus)}
                    className="text-xs font-semibold py-1.5 px-3 rounded-md border border-slate-300 bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Metadata & Activity History */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-3.5 text-xs">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">
              Task Details
            </h3>

            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Assigned To
                </span>
                <span className="font-semibold text-slate-900">
                  {task.assignedTo?.name || 'Unassigned'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Created By
                </span>
                <span className="font-semibold text-slate-900">
                  {task.createdBy?.name || 'Administrator'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Due Date
                </span>
                <span className="font-semibold text-slate-900">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  Created
                </span>
                <span className="text-slate-700">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  Last Updated
                </span>
                <span className="text-slate-700">
                  {new Date(task.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log for this task */}
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Activity History
            </h3>
            {activityLoading ? (
              <div className="py-4 text-center text-xs text-slate-400">Loading history...</div>
            ) : (
              <ActivityList activities={activities} emptyMessage="No activity recorded yet." />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmText="Delete"
        isDestructive
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
        onCancel={() => setShowDeleteModal(false)}
      />
    </div>
  );
};
