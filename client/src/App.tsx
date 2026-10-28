import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MemberDashboardPage } from './pages/MemberDashboardPage';
import { AllTasksPage } from './pages/AllTasksPage';
import { MyTasksPage } from './pages/MyTasksPage';
import { CreateTaskPage } from './pages/CreateTaskPage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { MembersPage } from './pages/MembersPage';
import { ActivityPage } from './pages/ActivityPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5000,
    },
  },
});

// Role-switched Dashboard Router
const DashboardSwitch: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'admin') {
    return <AdminDashboardPage />;
  }
  return <MemberDashboardPage />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Authenticated Application Shell */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardSwitch />} />
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />

              {/* Administrator Only Routes */}
              <Route
                path="/tasks"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <AllTasksPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tasks/new"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <CreateTaskPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/members"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <MembersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/activity"
                element={
                  <ProtectedRoute allowedRole="admin">
                    <ActivityPage />
                  </ProtectedRoute>
                }
              />

              {/* Member Only Routes */}
              <Route
                path="/my-tasks"
                element={
                  <ProtectedRoute>
                    <MyTasksPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
