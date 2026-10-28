import React from 'react';
import { TaskPriority } from '../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const config = {
    low: {
      label: 'Low',
      className: 'bg-slate-100 text-slate-600 border-slate-200',
    },
    medium: {
      label: 'Medium',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    high: {
      label: 'High',
      className: 'bg-rose-50 text-rose-700 border-rose-200',
    },
  }[priority] || {
    label: priority,
    className: 'bg-slate-100 text-slate-600 border-slate-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
};
