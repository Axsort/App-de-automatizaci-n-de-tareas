import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Users, Workflow } from 'lucide-react';
import { dashboardService } from '../../../shared/services';
import type { DashboardData } from '../../../shared/types';
import { KpiCard, Card } from '../../../shared/components/Card';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Badge } from '../../../shared/components/Badge';
import { PageLoader } from '../../../shared/components/Spinner';
import { ErrorState } from '../../../shared/components/EmptyState';
import { formatDate } from '../../../shared/utils';

const statusVariant = (status: string) => {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'failed';
  return 'partial';
};

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await dashboardService.get();
      setData(res.data.data);
    } catch {
      setError('No se pudo cargar el dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!data) return null;

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Resumen"
        title="Dashboard"
        description="Monitorea automatizaciones activas, ejecuciones del día y actividad reciente del sistema."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard variant="brand" label="Automatizaciones activas" value={data.activeAutomations} icon={<Workflow className="h-6 w-6" />} />
        <KpiCard variant="accent" label="Ejecuciones hoy" value={data.todayExecutions} icon={<Activity className="h-6 w-6" />} />
        <KpiCard variant="rose" label="Fallos hoy" value={data.todayFailures} icon={<AlertTriangle className="h-6 w-6" />} />
        <KpiCard variant="amber" label="Usuarios activos" value={data.activeUsers} icon={<Users className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Fallos recientes" accent="rose">
          {data.recentFailures.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Sin fallos recientes — todo en orden ✓</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentFailures.map((f) => (
                <li key={f.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{f.automationName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{f.errorMessage || f.message}</p>
                  </div>
                  <Badge variant={statusVariant(f.status) as 'success' | 'failed' | 'partial'}>{f.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Actividad reciente" accent="brand">
          {data.recentActivity.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Sin actividad registrada</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.action}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{a.userName} · {a.resourceType}</p>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
