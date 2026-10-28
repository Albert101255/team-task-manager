import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Mail, Calendar, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

export const MembersPage: React.FC = () => {
  const { data: membersData, isLoading } = useQuery({
    queryKey: ['members-full'],
    queryFn: () => api.getUsers(),
  });

  const users = membersData?.users || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Team Members</h1>
        <p className="mt-1 text-sm text-slate-500">
          Directory of registered workspace administrators and members.
        </p>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-400">Loading members...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">No members registered yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4 text-right">Assignments</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const initials = u.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <tr key={u.id || u._id} className="hover:bg-slate-50/75 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-200">
                            {initials}
                          </div>
                          <div>
                            <span className="font-medium text-slate-900 block">{u.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${
                            u.role === 'admin'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.role === 'admin' ? 'Administrator' : 'Member'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {u.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(u.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {u.role === 'member' ? (
                          <Link
                            to={`/tasks?assignedTo=${u.id || u._id}`}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            View Tasks
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
