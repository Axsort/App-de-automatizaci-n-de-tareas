interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}

export function Card({ title, children, className = '', action }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between">
          {title && <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h2>}
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
}

export function KpiCard({ label, value, icon, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend && <p className="mt-1 text-xs text-slate-400">{trend}</p>}
        </div>
        <div className="rounded-lg bg-primary-50 p-3 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
  );
}
