import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  User,
  Globe,
  Target,
  Code2,
  ClipboardCheck,
  GitCompare,
  GraduationCap,
  BookOpen,
  Briefcase,
  FileText,
  TrendingUp,
  Building2,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  Award,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import type { UserRole } from '@/types';

interface NavItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
}

const studentNav: NavItem[] = [
  { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/student/profile', icon: User },
  { label: 'Domains', path: '/student/domains', icon: Globe },
  { label: 'Skills', path: '/student/skills', icon: Code2 },
  { label: 'Assessment', path: '/student/assessment', icon: ClipboardCheck },
  { label: 'Skill Gap', path: '/student/skill-gap', icon: GitCompare },
  { label: 'Training', path: '/student/training', icon: GraduationCap },
  { label: 'My Training', path: '/student/training-progress', icon: BookOpen },
  { label: 'Jobs', path: '/student/jobs', icon: Briefcase },
  { label: 'Applications', path: '/student/applications', icon: FileText },
  { label: 'Employment', path: '/student/employment', icon: TrendingUp },
];

const instituteNav: NavItem[] = [
  { label: 'Dashboard', path: '/institute/dashboard', icon: LayoutDashboard },
  { label: 'Profile', path: '/institute/profile', icon: Building2 },
  { label: 'Programs', path: '/institute/programs', icon: GraduationCap },
  { label: 'Students', path: '/institute/students', icon: Users },
  { label: 'Outcomes', path: '/institute/outcomes', icon: Award },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'Domains', path: '/admin/domains', icon: Globe },
  { label: 'Skills', path: '/admin/skills', icon: Code2 },
  { label: 'Jobs', path: '/admin/jobs', icon: Briefcase },
  { label: 'Training', path: '/admin/training', icon: GraduationCap },
  { label: 'Institutes', path: '/admin/institutes', icon: Building2 },
];

function getNavItems(role: UserRole): NavItem[] {
  switch (role) {
    case 'student': return studentNav;
    case 'institute': return instituteNav;
    case 'admin': return adminNav;
  }
}

function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'student': return 'Student Portal';
    case 'institute': return 'Institute Portal';
    case 'admin': return 'Admin Portal';
  }
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;

  const navItems = getNavItems(user.role);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-40 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-200">
          <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900">SkillTrack</p>
            <p className="text-xs text-gray-400">{getRoleLabel(user.role)}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-0.5 transition-colors ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon className="w-4.5 h-4.5" style={{ width: 18, height: 18 }} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {user.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              {navItems.find((n) => n.path === location.pathname)?.label || 'SkillTrack'}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-gray-500 hover:text-indigo-600 hidden sm:block">
              Home
            </Link>
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold text-sm">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
