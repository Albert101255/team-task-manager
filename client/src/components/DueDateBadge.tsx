import React from 'react';
import { Calendar, AlertCircle } from 'lucide-react';
import { TaskStatus } from '../types';

interface DueDateBadgeProps {
  dueDate: string;
  status: TaskStatus;
}

export const DueDateBadge: React.FC<DueDateBadgeProps> = ({ dueDate, status }) => {
  const date = new Date(dueDate);
  const now = new Date();

  // Normalize to local date boundary (midnight) for accurate day comparisons
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const diffDays = Math.round((dateStart - todayStart) / (1000 * 60 * 60 * 24));

  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
        <Calendar className="w-3.5 h-3.5 text-slate-400" />
        {formattedDate}
      </span>
    );
  }

  if (diffDays < 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
        <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
        Overdue ({formattedDate})
      </span>
    );
  }

  if (diffDays === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
        <Calendar className="w-3.5 h-3.5 text-amber-600" />
        Due today
      </span>
    );
  }

  if (diffDays <= 2) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
        <Calendar className="w-3.5 h-3.5 text-blue-600" />
        In {diffDays} {diffDays === 1 ? 'day' : 'days'}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
      <Calendar className="w-3.5 h-3.5 text-slate-400" />
      {formattedDate}
    </span>
  );
};
