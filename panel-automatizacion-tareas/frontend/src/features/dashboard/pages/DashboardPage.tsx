import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, Users, Workflow } from 'lucide-react';
import { dashboardService } from '../../../shared/services';
import type { DashboardData } from '../../../shared/types';
import { KpiCard, Card } from '../../../shared/components/Card';
import { PageLoader } from '../../../shared/components/Spinner';
import { ErrorState } from '../../../shared/components/EmptyState';
import { formatDate, STATUS_COLORS } from '../../../shared/utils';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h2>
        <p className="text-slate-500">Resumen de actividad del sistema</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Automatizaciones activas" value={data.activeAutomations} icon={<Workflow className="h-6 w-6" />} />
        <KpiCard label="Ejecuciones hoy" value={data.todayExecutions} icon={<Activity className="h-6 w-6" />} />
        <KpiCard label="Fallos hoy" value={data.todayFailures} icon={<AlertTriangle className="h-6 w-6" />} />
        <KpiCard label="Usuarios activos" value={data.activeUsers} icon={<Users className="h-6 w-6" />} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Fallos recientes">
          {data.recentFailures.length === 0 ? (
            <p className="text-sm text-slate-500">Sin fallos recientes</p>
          ) : (
            <ul className="space-y-3">
              {data.recentFailures.map((f) => (
                <li key={f.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium">{f.automationName}</p>
                    <p className="text-xs text-slate-500">{f.errorMessage || f.message}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[f.status]}`}>
                    {f.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Actividad reciente">
          {data.recentActivity.length === 0 ? (
            <p className="text-sm text-slate-500">Sin actividad reciente</p>
          ) : (
            <ul className="space-y-3">
              {data.recentActivity.map((a) => (
                <li key={a.id} className="flex items-start justify-between border-b border-slate-100 pb-3 last:border-0 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-medium">{a.action}</p>
                    <p className="text-xs text-slate-500">{a.userName} · {a.resourceType}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(a.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
