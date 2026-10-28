import React from 'react';
import { ActivityLog } from '../types';
import { History, CheckCircle2, Clock, UserCheck, AlertCircle, Trash2 } from 'lucide-react';

interface ActivityListProps {
  activities: ActivityLog[];
  emptyMessage?: string;
}

export const ActivityList: React.FC<ActivityListProps> = ({
  activities,
  emptyMessage = 'No activity recorded yet.',
}) => {
  if (!activities || activities.length === 0) {
    return <p className="text-sm text-slate-500 py-4 text-center">{emptyMessage}</p>;
  }

  const getActionDetails = (act: ActivityLog) => {
    switch (act.action) {
      case 'TASK_CREATED':
        return {
          icon: <Clock className="w-3.5 h-3.5 text-blue-500" />,
          text: (
            <span>
              created this task{' '}
              {act.newValue && <span className="font-medium text-slate-800">"{act.newValue}"</span>}
            </span>
          ),
        };
      case 'TASK_ASSIGNED':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-indigo-500" />,
          text: (
            <span>
              assigned task to <span className="font-medium text-slate-800">{act.newValue}</span>
            </span>
          ),
        };
      case 'TASK_REASSIGNED':
        return {
          icon: <UserCheck className="w-3.5 h-3.5 text-amber-500" />,
          text: (
            <span>
              reassigned task from{' '}
              <span className="line-through text-slate-400">{act.oldValue}</span> to{' '}
              <span className="font-medium text-slate-800">{act.newValue}</span>
            </span>
          ),
        };
      case 'STATUS_CHANGED':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
          text: (
            <span>
              changed status from{' '}
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700">
                {act.oldValue}
              </span>{' '}
              to{' '}
              <span className="px-1.5 py-0.5 rounded text-[11px] font-mono bg-blue-50 text-blue-700 font-medium">
                {act.newValue}
              </span>
            </span>
          ),
        };
      case 'TASK_UPDATED':
        return {
          icon: <History className="w-3.5 h-3.5 text-slate-500" />,
          text: <span>updated task details</span>,
        };
      case 'TASK_DELETED':
        return {
          icon: <Trash2 className="w-3.5 h-3.5 text-rose-500" />,
          text: (
            <span>
              deleted task{' '}
              {act.oldValue && <span className="font-medium text-slate-800">"{act.oldValue}"</span>}
            </span>
          ),
        };
      default:
        return {
          icon: <AlertCircle className="w-3.5 h-3.5 text-slate-400" />,
          text: <span>performed an action</span>,
        };
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flow-root">
      <ul className="-mb-6">
        {activities.map((activity, index) => {
          const { icon, text } = getActionDetails(activity);
          const isLast = index === activities.length - 1;

          return (
            <li key={activity._id} className="relative pb-6">
              {!isLast && (
                <span
                  className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 border border-slate-200">
                  {icon}
                </div>
                <div className="min-w-0 flex-1 pt-1 flex justify-between space-x-4">
                  <div>
                    <p className="text-xs text-slate-600 leading-snug">
                      <span className="font-semibold text-slate-900">
                        {activity.performedBy?.name || 'User'}
                      </span>{' '}
                      {text}
                    </p>
                  </div>
                  <div className="whitespace-nowrap text-right text-xs text-slate-400">
                    {formatTimestamp(activity.createdAt)}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
