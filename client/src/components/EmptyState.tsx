import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  action,
}) => {
  return (
    <div className="text-center py-12 px-4 rounded-lg border border-dashed border-slate-300 bg-white">
      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">{description}</p>
      {action && (
        <div className="mt-4">
          <button
            onClick={action.onClick}
            className="inline-flex items-center px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
};
