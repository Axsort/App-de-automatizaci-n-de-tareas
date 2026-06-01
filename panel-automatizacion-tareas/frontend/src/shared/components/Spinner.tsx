interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  return (
    <div
      className={`animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-500 dark:border-brand-900 dark:border-t-brand-400 ${sizes[size]} ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}

export function PageLoader() {
  return (
    <div className="flex h-64 flex-col items-center justify-center gap-3">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-400">Cargando datos...</p>
    </div>
  );
}
