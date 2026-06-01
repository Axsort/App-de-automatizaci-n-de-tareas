import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Shield, Zap } from 'lucide-react';
import { authService } from '../../../shared/services';
import { useAuthStore } from '../store/authStore';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
});

type LoginForm = z.infer<typeof loginSchema>;

const features = [
  { icon: Zap, text: 'Automatiza flujos internos en minutos' },
  { icon: Shield, text: 'Seguridad empresarial con auditoría' },
  { icon: Sparkles, text: 'Reglas del tipo si X, entonces Y' },
];

export function LoginPage() {
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'admin@empresa.com' },
  });

  const onSubmit = async (data: LoginForm) => {
    setError('');
    try {
      const response = await authService.login(data.email, data.password);
      const { accessToken, user } = response.data.data;
      setAuth(accessToken, user);
      if (user.mustChangePassword) {
        navigate('/profile?changePassword=true');
      } else {
        navigate('/');
      }
    } catch {
      setError('Credenciales inválidas o cuenta bloqueada');
    }
  };

  return (
    <div className="relative flex min-h-screen overflow-hidden">
      {/* Fondo decorativo */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(148_163_184/0.08)_1px,transparent_0)] bg-[size:24px_24px]" />
      </div>

      {/* Panel izquierdo — branding */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 shadow-lg shadow-brand-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AutoPanel</span>
        </div>

        <div>
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight text-white">
            Automatiza las tareas
            <span className="block bg-gradient-to-r from-brand-300 to-accent-400 bg-clip-text text-transparent">
              de tu empresa
            </span>
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-slate-400">
            Define reglas, ejecuta flujos y monitorea la actividad de tu equipo desde un panel centralizado.
          </p>

          <ul className="mt-10 space-y-4">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/10">
                  <Icon className="h-4 w-4 text-brand-300" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-slate-600">© 2026 AutoPanel · Panel de automatización PYME</p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="glass-panel w-full max-w-md rounded-3xl p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 shadow-lg shadow-brand-500/25">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Bienvenido</h1>
            <p className="mt-1 text-sm text-slate-500">Inicia sesión en tu panel</p>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Iniciar sesión</h1>
            <p className="mt-1 text-sm text-slate-500">Acceso restringido a usuarios autorizados</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email corporativo"
              type="email"
              autoComplete="email"
              placeholder="admin@empresa.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {error}
              </div>
            )}

            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Entrar al panel
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-slate-400">
            ¿Problemas de acceso? Contacte al administrador del sistema.
          </p>
        </div>
      </div>
    </div>
  );
}
