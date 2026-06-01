import { clsx } from '../utils';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
  hover?: boolean;
  accent?: 'brand' | 'accent' | 'rose' | 'none';
}

export function Card({ title, children, className = '', action, hover = false, accent = 'none' }: CardProps) {
  const accentBorder = {
    brand: 'border-t-2 border-t-brand-500',
    accent: 'border-t-2 border-t-accent-500',
    rose: 'border-t-2 border-t-rose-500',
    none: '',
  };

  return (
    <div
      className={clsx(
        'rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm',
        'dark:border-slate-800/80 dark:bg-slate-900/70',
        accentBorder[accent],
        hover && 'card-hover',
        className
      )}
    >
      {(title || action) && (
        <div className="mb-5 flex items-center justify-between gap-4">
          {title && (
            <h2 className="text-base font-bold tracking-tight text-slate-800 dark:text-slate-100">
              {title}
            </h2>
          )}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  variant?: 'brand' | 'accent' | 'rose' | 'amber';
}

const kpiStyles = {
  brand: {
    icon: 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30',
    glow: 'from-brand-500/10 to-transparent',
  },
  accent: {
    icon: 'bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30',
    glow: 'from-accent-500/10 to-transparent',
  },
  rose: {
    icon: 'bg-gradient-to-br from-rose-500 to-rose-600 text-white shadow-lg shadow-rose-500/30',
    glow: 'from-rose-500/10 to-transparent',
  },
  amber: {
    icon: 'bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30',
    glow: 'from-amber-500/10 to-transparent',
  },
};

export function KpiCard({ label, value, icon, trend, variant = 'brand' }: KpiCardProps) {
  const style = kpiStyles[variant];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/70">
      <div className={clsx('pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity group-hover:opacity-100', style.glow)} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
        </div>
        <div className={clsx('rounded-xl p-3', style.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}
