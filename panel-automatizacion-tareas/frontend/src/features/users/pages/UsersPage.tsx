import { useEffect, useState } from 'react';
import { Plus, UserCheck, UserX } from 'lucide-react';
import { userService } from '../../../shared/services';
import type { User, PageResponse } from '../../../shared/types';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { EmptyState, ErrorState } from '../../../shared/components/EmptyState';
import { PageLoader } from '../../../shared/components/Spinner';
import { ROLE_LABELS, formatDate } from '../../../shared/utils';
import { useAuthStore } from '../../auth/store/authStore';
import { UserFormModal } from '../components/UserFormModal';

export function UsersPage() {
  const [data, setData] = useState<PageResponse<User> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const isAdmin = useAuthStore((s) => s.hasRole('ADMIN'));

  const load = async () => {
    setLoading(true);
    try {
      const res = await userService.list({ page: 0, size: 50 });
      setData(res.data.data);
    } catch {
      setError('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (user: User) => {
    await userService.toggleActive(user.id, !user.active);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de usuarios</h2>
          <p className="text-slate-500">Administre usuarios, roles y permisos</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setEditUser(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" /> Nuevo usuario
          </Button>
        )}
      </div>

      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !data?.content.length ? (
        <EmptyState title="Sin usuarios" />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left dark:border-slate-700">
                  <th className="pb-3 pr-4 font-medium">Usuario</th>
                  <th className="pb-3 pr-4 font-medium">Rol</th>
                  <th className="pb-3 pr-4 font-medium">Estado</th>
                  <th className="pb-3 pr-4 font-medium">Último acceso</th>
                  {isAdmin && <th className="pb-3 font-medium">Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => (
                  <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800">
                    <td className="py-3 pr-4">
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </td>
                    <td className="py-3 pr-4">{ROLE_LABELS[user.role]}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${user.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Nunca'}
                    </td>
                    {isAdmin && (
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Button variant="secondary" size="sm" onClick={() => { setEditUser(user); setModalOpen(true); }}>
                            Editar
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => toggleActive(user)}>
                            {user.active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalOpen && (
        <UserFormModal
          user={editUser}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); load(); }}
        />
      )}
    </div>
  );
}
