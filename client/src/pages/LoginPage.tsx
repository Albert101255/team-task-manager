import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FolderKanban, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect
  React.useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2.5">
          <div className="w-9 h-9 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold">
            <FolderKanban className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">Team Tasks</span>
        </div>
        <h2 className="mt-5 text-center text-xl font-semibold tracking-tight text-slate-900">
          Sign in to your workspace
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500">
          Enter your credentials to access assigned tasks and team updates.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-8 rounded-lg border border-slate-200 shadow-sm">
          {error && (
            <div className="mb-5 p-3 rounded-md bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@teamtasks.io"
                className="mt-1.5 block w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700">
                Password
              </label>
              <div className="mt-1.5 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full px-3 py-2 pr-10 text-sm bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-slate-900 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 flex justify-center py-2 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200 text-center">
            <p className="text-xs text-slate-600">
              New team member?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
