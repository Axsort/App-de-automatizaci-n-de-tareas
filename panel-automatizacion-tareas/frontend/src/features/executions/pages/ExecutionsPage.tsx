import { useEffect, useState } from 'react';
import { executionService } from '../../../shared/services';
import type { Execution, PageResponse } from '../../../shared/types';
import { Card } from '../../../shared/components/Card';
import { EmptyState, ErrorState } from '../../../shared/components/EmptyState';
import { PageLoader } from '../../../shared/components/Spinner';
import { formatDate, STATUS_COLORS } from '../../../shared/utils';

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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Historial de ejecuciones</h2>
        <p className="text-slate-500">Registro de todas las ejecuciones de automatizaciones</p>
      </div>

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
      >
        <option value="">Todos los estados</option>
        <option value="SUCCESS">Éxito</option>
        <option value="FAILED">Fallido</option>
        <option value="PARTIAL">Parcial</option>
      </select>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <EmptyState title="Sin ejecuciones" description="Las ejecuciones aparecerán aquí" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th className="pb-3 pr-4 font-medium">Automatización</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 pr-4 font-medium">Mensaje</th>
                  <th className="pb-3 pr-4 font-medium">Ejecutado por</th>
                  <th className="pb-3 font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((ex) => (
                  <tr key={ex.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4">{ex.automationName}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[ex.status]}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">{ex.errorMessage || ex.message || '—'}</td>
                    <td className="py-3 pr-4">{ex.executedByName}</td>
                    <td className="py-3">{formatDate(ex.executedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
