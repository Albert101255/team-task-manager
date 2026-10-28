import React from 'react';
import { Search, X } from 'lucide-react';
import { User } from '../types';

interface TaskFiltersProps {
  status: string;
  setStatus: (status: string) => void;
  priority: string;
  setPriority: (priority: string) => void;
  assignedTo?: string;
  setAssignedTo?: (assignedTo: string) => void;
  search: string;
  setSearch: (search: string) => void;
  members?: User[];
  showMemberFilter?: boolean;
  onClear: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  status,
  setStatus,
  priority,
  setPriority,
  assignedTo,
  setAssignedTo,
  search,
  setSearch,
  members,
  showMemberFilter = false,
  onClear,
}) => {
  const hasActiveFilters = Boolean(status || priority || assignedTo || search);

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search tasks by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 placeholder-slate-400"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Member Filter (Admin only) */}
        {showMemberFilter && setAssignedTo && members && (
          <select
            value={assignedTo || ''}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All Assignees</option>
            {members.map((member) => (
              <option key={member.id || member._id} value={member.id || member._id}>
                {member.name}
              </option>
            ))}
          </select>
        )}

        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 border border-transparent rounded-md hover:bg-slate-100"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
};
