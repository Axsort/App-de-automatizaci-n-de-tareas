import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
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

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/automations': 'Automatizaciones',
  '/executions': 'Ejecuciones',
  '/users': 'Usuarios',
  '/audit': 'Auditoría',
  '/profile': 'Mi perfil',
};

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasRole } = useAuthStore();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } finally {
      logout();
      navigate('/login');
    }
  };

  const filteredNav = navItems.filter((item) => item.roles.some((r) => hasRole(r as never)));
  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.includes('/automations') ? 'Automatizaciones' : 'Panel');

  return (
    <div className="flex min-h-screen">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={clsx(
          'glass-sidebar fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col transition-transform duration-300 lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/25">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">AutoPanel</span>
              <p className="text-[10px] font-medium uppercase tracking-widest text-slate-400">Automatización</p>
            </div>
          </div>
          <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">Menú</p>
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'nav-link-active pl-4 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                )
              }
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200/80 p-4 dark:border-slate-800/80">
          <div className="mb-3 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100/80 p-3 dark:from-slate-800/50 dark:to-slate-800/30">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-xs font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-slate-500">{user?.role && ROLE_LABELS[user.role]}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/70 px-4 backdrop-blur-xl sm:px-6 dark:border-slate-800/80 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <button
              className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-slate-100 lg:hidden dark:hover:bg-slate-800"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sección</p>
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">{currentTitle}</h1>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className="rounded-xl border border-slate-200/80 bg-white/80 p-2.5 text-slate-500 shadow-sm transition-all hover:border-brand-300 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-brand-500/50 dark:hover:text-brand-400"
            aria-label="Cambiar tema"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
