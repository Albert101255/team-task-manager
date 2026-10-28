import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity as ActivityIcon } from 'lucide-react';
import { api } from '../services/api';
import { ActivityList } from '../components/ActivityList';

export const ActivityPage: React.FC = () => {
  const { data: activityData, isLoading } = useQuery({
    queryKey: ['full-activity-log'],
    queryFn: () => api.getAllActivities(50),
  });

  const activities = activityData?.activities || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
          <ActivityIcon className="w-5 h-5 text-blue-600" />
          Activity Audit Log
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Chronological audit trail of all task mutations, reassignments, and status transitions.
        </p>
      </div>

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
