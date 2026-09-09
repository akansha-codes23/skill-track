import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Mail, Lock, AlertCircle, User, Building2, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  try {
    const user = await login(email, password);

    if (!user) {
      setError('Invalid email or password. Try the demo accounts below.');
      return;
    }

    redirectByRole(user.role, navigate);
  } catch (error) {
    console.error('Login failed:', error);

    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError('Invalid email or password. Please try again.');
    }
  }
};

  const handleDemoLogin = async (role: UserRole) => {
    const demoEmails: Record<UserRole, string> = {
      student: 'student@demo.com',
      institute: 'institute@demo.com',
      admin: 'admin@demo.com',
    };
    const user = await login(demoEmails[role], 'demo123');
    if (user) redirectByRole(user.role, navigate);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-gray-900">SkillTrack</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-500 mb-6">Login to your SkillTrack account</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg text-sm mb-4">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input type="checkbox" className="rounded border-gray-300" /> Remember me
              </label>
              <Link to="/forgot-password" className="text-indigo-600 hover:text-indigo-700 font-medium">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-400 text-center mb-3">Quick demo login</p>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => handleDemoLogin('student')} className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-gray-700">Student</span>
              </button>
              <button onClick={() => handleDemoLogin('institute')} className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:bg-teal-50 transition-colors">
                <Building2 className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-medium text-gray-700">Institute</span>
              </button>
              <button onClick={() => handleDemoLogin('admin')} className="flex flex-col items-center gap-1 p-3 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">
                <Shield className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-medium text-gray-700">Admin</span>
              </button>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function redirectByRole(
  role: UserRole,
  navigate: (path: string) => void
) {
  switch (role) {
    case 'student':
      navigate('/student/dashboard');
      break;
    case 'institute':
      navigate('/institute/dashboard');
      break;
    case 'admin':
      navigate('/admin/dashboard');
      break;
  }
}
