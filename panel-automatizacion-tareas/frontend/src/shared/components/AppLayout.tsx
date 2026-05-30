import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Workflow,
  History,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '../../features/auth/store/authStore';
import { useThemeStore } from '../hooks/useThemeStore';
import { authService } from '../services';
import { ROLE_LABELS } from '../utils';
import { clsx } from '../utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
  { to: '/automations', icon: Workflow, label: 'Automatizaciones', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
  { to: '/executions', icon: History, label: 'Ejecuciones', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
  { to: '/users', icon: Users, label: 'Usuarios', roles: ['ADMIN', 'MANAGER'] },
  { to: '/audit', icon: Shield, label: 'Auditoría', roles: ['ADMIN'] },
  { to: '/profile', icon: Settings, label: 'Perfil', roles: ['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER'] },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasRole } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const filteredNav = navItems.filter((item) => item.roles.some((r) => hasRole(r as never)));

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 dark:border-slate-800">
          <span className="text-lg font-bold text-primary-600">AutoPanel</span>
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="mb-3 px-3">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-slate-500">{user?.role && ROLE_LABELS[user.role]}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            Panel de Automatización
          </h1>
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
