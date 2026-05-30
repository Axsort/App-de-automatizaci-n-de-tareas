import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authService, userService } from '../../../shared/services';
import type { User } from '../../../shared/types';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { PageLoader } from '../../../shared/components/Spinner';
import { ROLE_LABELS } from '../../../shared/utils';
import { useAuthStore } from '../../auth/store/authStore';

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Mínimo 8 caracteres'),
});

export function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchParams] = useSearchParams();
  const authUser = useAuthStore((s) => s.user);

  const form = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    userService.getProfile().then((res) => {
      setProfile(res.data.data);
      setLoading(false);
    });
  }, []);

  const onChangePassword = async (data: z.infer<typeof passwordSchema>) => {
    setMessage('');
    try {
      await authService.changePassword(data.currentPassword, data.newPassword);
      setMessage('Contraseña actualizada correctamente');
      form.reset();
    } catch {
      setMessage('Error al cambiar la contraseña');
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h2 className="text-2xl font-bold">Mi perfil</h2>

      {(searchParams.get('changePassword') === 'true' || authUser?.mustChangePassword) && (
        <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
          Debe cambiar su contraseña antes de continuar.
        </div>
      )}

      <Card title="Información personal">
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">Nombre</dt>
            <dd className="font-medium">{profile?.fullName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Email</dt>
            <dd className="font-medium">{profile?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">Rol</dt>
            <dd className="font-medium">{profile?.role && ROLE_LABELS[profile.role]}</dd>
          </div>
        </dl>
      </Card>

      <Card title="Cambiar contraseña">
        <form onSubmit={form.handleSubmit(onChangePassword)} className="space-y-4">
          <input
            {...form.register('currentPassword')}
            type="password"
            placeholder="Contraseña actual"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
          <input
            {...form.register('newPassword')}
            type="password"
            placeholder="Nueva contraseña"
            className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800"
          />
          {form.formState.errors.newPassword && (
            <p className="text-xs text-red-500">{form.formState.errors.newPassword.message}</p>
          )}
          {message && <p className="text-sm text-green-600">{message}</p>}
          <Button type="submit" loading={form.formState.isSubmitting}>Actualizar contraseña</Button>
        </form>
      </Card>
    </div>
  );
}
