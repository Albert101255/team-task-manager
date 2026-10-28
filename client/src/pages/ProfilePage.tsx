import React from 'react';
import { User, Mail, Shield, Calendar, Clock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">User Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Your workspace identity and account permissions.
        </p>
      </div>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner / Header */}
        <div className="p-6 bg-slate-50/75 border-b border-slate-200 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white font-bold text-lg flex items-center justify-center shadow-sm">
            {initials}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                  user.role === 'admin'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                }`}
              >
                {user.role === 'admin' ? 'Administrator' : 'Team Member'}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500">{user.email}</span>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="p-6 space-y-4 text-sm divide-y divide-slate-100">
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Full Name
            </span>
            <span className="font-semibold text-slate-900">{user.name}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address
            </span>
            <span className="font-semibold text-slate-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Role Permissions
            </span>
            <span className="font-semibold text-slate-900 capitalize">
              {user.role === 'admin' ? 'Full Administrator Access' : 'Member Access (Assigned Tasks)'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Member Since
            </span>
            <span className="text-slate-700">
              {new Date(user.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>

          <div className="flex items-center justify-between pt-3">
            <span className="text-slate-500 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Session Type
            </span>
            <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
              HttpOnly Secure Cookie (JWT)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
