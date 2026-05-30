import { useEffect, useState } from 'react';
import { auditService } from '../../../shared/services';
import type { AuditLog, PageResponse } from '../../../shared/types';
import { Card } from '../../../shared/components/Card';
import { EmptyState, ErrorState } from '../../../shared/components/EmptyState';
import { PageLoader } from '../../../shared/components/Spinner';
import { formatDate } from '../../../shared/utils';

export function AuditPage() {
  const [data, setData] = useState<PageResponse<AuditLog> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await auditService.list({ search: search || undefined, page: 0, size: 50 });
      setData(res.data.data);
    } catch {
      setError('Error al cargar auditoría');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Auditoría</h2>
        <p className="text-slate-500">Registro de actividad del sistema (solo ADMIN)</p>
      </div>

      <input
        type="search"
        placeholder="Buscar acción o recurso..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
      />

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <EmptyState title="Sin registros de auditoría" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th className="pb-3 pr-4 font-medium">Fecha</th>
                  <th className="pb-3 pr-4 font-medium">Usuario</th>
                  <th className="pb-3 pr-4 font-medium">Acción</th>
                  <th className="pb-3 pr-4 font-medium">Recurso</th>
                  <th className="pb-3 font-medium">IP</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((log) => (
                  <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4 whitespace-nowrap">{formatDate(log.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <p>{log.userName}</p>
                      <p className="text-xs text-slate-500">{log.userEmail}</p>
                    </td>
                    <td className="py-3 pr-4 font-medium">{log.action}</td>
                    <td className="py-3 pr-4 text-slate-500">
                      {log.resourceType}{log.resourceId ? ` #${log.resourceId}` : ''}
                    </td>
                    <td className="py-3">{log.ipAddress || '—'}</td>
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
