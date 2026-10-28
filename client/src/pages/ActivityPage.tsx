import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { ActivityList } from '../components/ActivityList';

export const ActivityPage: React.FC = () => {
  const { data: activityData, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['full-activity-log'],
    queryFn: () => api.getAllActivities(50),
  });

  const activities = activityData?.activities || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-blue-600" />
            Activity Audit Log
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Chronological audit trail of all task mutations, reassignments, and status transitions.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-3 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Failed to load activity logs</p>
            <p className="mt-0.5 text-rose-600">{(error as any)?.message || 'An error occurred while fetching audit events.'}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="px-2.5 py-1 text-xs font-medium text-rose-700 bg-white border border-rose-300 rounded hover:bg-rose-50"
          >
            Retry
          </button>
        </div>
      )}

      {/* Activity Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        {isLoading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading audit history...</div>
        ) : (
          <ActivityList
            activities={activities}
            emptyMessage="No activity events recorded in the workspace yet."
          />
        )}
      </div>
    </div>
  );
};
