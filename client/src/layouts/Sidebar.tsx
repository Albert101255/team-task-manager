import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  PlusCircle,
  Users,
  Activity,
  User,
  LogOut,
  FolderKanban,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNav = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/tasks', label: 'All Tasks', icon: CheckSquare },
    { to: '/tasks/new', label: 'Create Task', icon: PlusCircle },
    { to: '/members', label: 'Members', icon: Users },
    { to: '/activity', label: 'Activity', icon: Activity },
  ];

  const memberNav = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
  ];

  const navItems = user?.role === 'admin' ? adminNav : memberNav;

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className="h-16 px-6 border-b border-slate-200 flex items-center gap-3">
        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center text-white font-semibold">
          <FolderKanban className="w-4 h-4" />
        </div>
        <div>
          <span className="text-sm font-bold text-slate-900 tracking-tight block">Team Tasks</span>
          <span className="text-[11px] text-slate-400 font-medium -mt-0.5 block">Workspace</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          );
        })}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center border border-slate-300">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${
                  user?.role === 'admin' ? 'bg-indigo-500' : 'bg-emerald-500'
                }`}
              />
              <span className="text-[11px] font-medium text-slate-500 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between px-1">
          <NavLink
            to="/profile"
            onClick={onCloseMobile}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-100"
          >
            <User className="w-3.5 h-3.5" />
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-rose-600 px-2 py-1 rounded hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
};
