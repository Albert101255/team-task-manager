import React from 'react';
import { TaskStatus } from '../types';

interface StatusBadgeProps {
  status: TaskStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = {
    todo: {
      label: 'To Do',
      dotColor: 'bg-slate-400',
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
    },
    in_progress: {
      label: 'In Progress',
      dotColor: 'bg-blue-500',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    completed: {
      label: 'Completed',
      dotColor: 'bg-emerald-500',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
  }[status] || {
    label: status,
    dotColor: 'bg-slate-400',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${config.badgeClass} ${sizeClasses}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {config.label}
    </span>
  );
};
