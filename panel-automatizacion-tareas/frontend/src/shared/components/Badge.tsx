import { clsx } from '../utils';

const variants = {
  success: 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200/60 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  failed: 'bg-rose-100 text-rose-800 ring-1 ring-rose-200/60 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/30',
  partial: 'bg-amber-100 text-amber-800 ring-1 ring-amber-200/60 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/30',
  active: 'bg-brand-100 text-brand-800 ring-1 ring-brand-200/60 dark:bg-brand-500/15 dark:text-brand-300 dark:ring-brand-500/30',
  inactive: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200/60 dark:bg-slate-700/50 dark:text-slate-400 dark:ring-slate-600/30',
  neutral: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

interface BadgeProps {
  variant?: keyof typeof variants;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span className={clsx('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
