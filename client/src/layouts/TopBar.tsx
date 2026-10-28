import React from 'react';
import { Menu, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface TopBarProps {
  onToggleMobile: () => void;
  title: string;
}

export const TopBar: React.FC<TopBarProps> = ({ onToggleMobile, title }) => {
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="md:hidden p-2 text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        {user?.role === 'admin' ? (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Administrator
          </span>
        ) : (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <UserCheck className="w-3.5 h-3.5" />
            Team Member
          </span>
        )}

        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-xs flex items-center justify-center border border-slate-300">
          {initials}
        </div>
      </div>
    </header>
  );
};
