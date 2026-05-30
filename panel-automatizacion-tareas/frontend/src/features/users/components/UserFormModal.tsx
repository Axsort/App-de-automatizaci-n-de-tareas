import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { userService } from '../../../shared/services';
import type { User } from '../../../shared/types';
import { Button } from '../../../shared/components/Button';

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR', 'VIEWER']),
});

const updateSchema = createSchema.omit({ password: true });

interface Props {
  user: User | null;
  onClose: () => void;
  onSaved: () => void;
}

export function UserFormModal({ user, onClose, onSaved }: Props) {
  const isEdit = Boolean(user);
  const schema = isEdit ? updateSchema : createSchema;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: user ? {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    } : {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      role: 'VIEWER' as const,
    },
  });

  const onSubmit = async (data: Record<string, unknown>) => {
    if (isEdit && user) {
      await userService.update(user.id, data);
    } else {
      await userService.create(data);
    }
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 dark:bg-slate-900">
        <h3 className="mb-4 text-lg font-semibold">{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input {...register('email')} placeholder="Email" className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
          {errors.email && <p className="text-xs text-red-500">{String(errors.email.message)}</p>}
          {!isEdit && (
            <input {...register('password' as never)} type="password" placeholder="Contraseña" className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
          )}
          <input {...register('firstName')} placeholder="Nombre" className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
          <input {...register('lastName')} placeholder="Apellido" className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
          <select {...register('role')} className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
            <option value="VIEWER">Visualizador</option>
            <option value="OPERATOR">Operador</option>
            <option value="MANAGER">Gerente</option>
            <option value="ADMIN">Administrador</option>
          </select>
          <div className="flex gap-2 pt-2">
            <Button type="submit" loading={isSubmitting}>Guardar</Button>
            <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
