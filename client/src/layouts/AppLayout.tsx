import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string) => {
    if (path === '/dashboard') return 'Overview';
    if (path === '/tasks') return 'All Tasks';
    if (path === '/tasks/new') return 'Create Task';
    if (path.startsWith('/tasks/')) return 'Task Details';
    if (path === '/my-tasks') return 'My Tasks';
    if (path === '/members') return 'Team Members';
    if (path === '/activity') return 'Activity Audit Log';
    if (path === '/profile') return 'My Profile';
    return 'Workspace';
  };

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white z-50">
            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopBar onToggleMobile={() => setMobileOpen(!mobileOpen)} title={title} />
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
