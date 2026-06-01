import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Copy, Play, Pencil, Trash2, Search } from 'lucide-react';
import { automationService } from '../../../shared/services';
import type { Automation, PageResponse } from '../../../shared/types';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { PageHeader } from '../../../shared/components/PageHeader';
import { Badge } from '../../../shared/components/Badge';
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
    <div className="space-y-8">
      <PageHeader
        badge="Flujos"
        title="Automatizaciones"
        description="Crea y gestiona reglas del tipo si ocurre X, entonces hacer Y."
        action={canEdit && (
          <Link to="/automations/new">
            <Button><Plus className="h-4 w-4" /> Nueva automatización</Button>
          </Link>
        )}
      />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <Card>
          <EmptyState
            title="Sin automatizaciones"
            description="Crea tu primera regla para empezar a automatizar tareas internas."
            action={canEdit && <Link to="/automations/new"><Button>Crear automatización</Button></Link>}
          />
        </Card>
      ) : (
        <div className="grid gap-4">
          {data.content.map((auto) => (
            <Card key={auto.id} hover accent="brand">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{auto.name}</h3>
                    <Badge variant={auto.active ? 'active' : 'inactive'}>
                      {auto.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  {auto.description && (
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{auto.description}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {TRIGGER_LABELS[auto.triggerType]}
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {auto.conditions.length} condiciones
                    </span>
                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      {auto.actions.length} acciones
                    </span>
                    <span className="text-xs text-slate-400">· {formatDate(auto.updatedAt)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {canEdit && (
                    <>
                      <Link to={`/automations/${auto.id}/edit`}>
                        <Button variant="secondary" size="sm" title="Editar"><Pencil className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="secondary" size="sm" title="Duplicar" onClick={() => handleDuplicate(auto.id)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" title="Ejecutar" onClick={() => handleExecute(auto.id)}>
                        <Play className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  {canDelete && (
                    <Button variant="danger" size="sm" title="Eliminar" onClick={() => handleDelete(auto.id)}>
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
