import { AlertCircle, Inbox, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 ring-1 ring-slate-200/80 dark:from-slate-800 dark:to-slate-900 dark:ring-slate-700">
        <Inbox className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message = 'Ocurrió un error', onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-200/60 bg-rose-50/50 py-12 text-center dark:border-rose-500/20 dark:bg-rose-500/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/15">
        <AlertCircle className="h-7 w-7 text-rose-500" />
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-300">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  );
}

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <Sparkles className="mb-3 h-6 w-6 animate-pulse text-brand-500" />
      <p className="text-sm text-slate-400">Cargando...</p>
    </div>
  );
}
