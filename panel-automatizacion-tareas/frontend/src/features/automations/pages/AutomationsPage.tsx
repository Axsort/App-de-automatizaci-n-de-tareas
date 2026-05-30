import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Play, Pencil, Trash2 } from 'lucide-react';
import { automationService } from '../../../shared/services';
import type { Automation, PageResponse } from '../../../shared/types';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState, ErrorState } from '../../../shared/components/EmptyState';
import { PageLoader } from '../../../shared/components/Spinner';
import { TRIGGER_LABELS, formatDate } from '../../../shared/utils';
import { useAuthStore } from '../../auth/store/authStore';

export function AutomationsPage() {
  const [data, setData] = useState<PageResponse<Automation> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const hasRole = useAuthStore((s) => s.hasRole);

  const load = async () => {
    setLoading(true);
    try {
      const res = await automationService.list({ search: search || undefined, page: 0, size: 20 });
      setData(res.data.data);
    } catch {
      setError('Error al cargar automatizaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar esta automatización?')) return;
    await automationService.delete(id);
    load();
  };

  const handleDuplicate = async (id: number) => {
    await automationService.duplicate(id);
    load();
  };

  const handleExecute = async (id: number) => {
    await automationService.execute(id);
    alert('Ejecución completada');
  };

  const canEdit = hasRole('ADMIN', 'MANAGER', 'OPERATOR');
  const canDelete = hasRole('ADMIN', 'MANAGER');

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automatizaciones</h2>
          <p className="text-slate-500">Gestione sus flujos de automatización</p>
        </div>
        {canEdit && (
          <Link to="/automations/new">
            <Button><Plus className="h-4 w-4" /> Nueva automatización</Button>
          </Link>
        )}
      </div>

      <input
        type="search"
        placeholder="Buscar por nombre..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full max-w-md rounded-lg border border-slate-300 px-4 py-2 dark:border-slate-600 dark:bg-slate-800"
      />

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <EmptyState
          title="Sin automatizaciones"
          description="Cree su primera regla de automatización"
          action={canEdit && <Link to="/automations/new"><Button>Crear automatización</Button></Link>}
        />
      ) : (
        <div className="grid gap-4">
          {data.content.map((auto) => (
            <Card key={auto.id}>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{auto.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${auto.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {auto.active ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{auto.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-400">
                    <span>Trigger: {TRIGGER_LABELS[auto.triggerType]}</span>
                    <span>·</span>
                    <span>{auto.conditions.length} condiciones</span>
                    <span>·</span>
                    <span>{auto.actions.length} acciones</span>
                    <span>·</span>
                    <span>Actualizado: {formatDate(auto.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit && (
                    <>
                      <Link to={`/automations/${auto.id}/edit`}>
                        <Button variant="secondary" size="sm"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="secondary" size="sm" onClick={() => handleDuplicate(auto.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleExecute(auto.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {canDelete && (
                    <Button variant="danger" size="sm" onClick={() => handleDelete(auto.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
