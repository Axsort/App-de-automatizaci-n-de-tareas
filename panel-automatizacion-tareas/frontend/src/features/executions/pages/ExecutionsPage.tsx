import { useEffect, useState } from 'react';
import { executionService } from '../../../shared/services';
import type { Execution, PageResponse } from '../../../shared/types';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Badge } from '../../../shared/components/Badge';
import { EmptyState, ErrorState } from '../../../shared/components/EmptyState';
import { PageLoader } from '../../../shared/components/Spinner';
import { formatDate } from '../../../shared/utils';
import { Select } from '../../../shared/components/Input';

const statusVariant = (status: string) => {
  if (status === 'SUCCESS') return 'success';
  if (status === 'FAILED') return 'failed';
  return 'partial';
};

export function ExecutionsPage() {
  const [data, setData] = useState<PageResponse<Execution> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await executionService.list({
        status: statusFilter || undefined,
        page: 0,
        size: 20,
      });
      setData(res.data.data);
    } catch {
      setError('Error al cargar ejecuciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statusFilter]);

  return (
    <div className="space-y-8">
      <PageHeader
        badge="Historial"
        title="Ejecuciones"
        description="Registro de todas las ejecuciones de automatizaciones con estado y detalle de errores."
      />

      <Select
        label="Filtrar por estado"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="max-w-xs"
      >
        <option value="">Todos los estados</option>
        <option value="SUCCESS">Éxito</option>
        <option value="FAILED">Fallido</option>
        <option value="PARTIAL">Parcial</option>
      </Select>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <div className="table-shell">
          <EmptyState title="Sin ejecuciones" description="Las ejecuciones aparecerán aquí cuando corras automatizaciones." />
        </div>
      ) : (
        <div className="table-shell">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/40">
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Automatización</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Mensaje</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Ejecutado por</th>
                  <th className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.content.map((ex) => (
                  <tr key={ex.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/30">
                    <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{ex.automationName}</td>
                    <td className="px-5 py-4">
                      <Badge variant={statusVariant(ex.status) as 'success' | 'failed' | 'partial'}>{ex.status}</Badge>
                    </td>
                    <td className="max-w-xs truncate px-5 py-4 text-slate-500">{ex.errorMessage || ex.message || '—'}</td>
                    <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{ex.executedByName}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-slate-400">{formatDate(ex.executedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
