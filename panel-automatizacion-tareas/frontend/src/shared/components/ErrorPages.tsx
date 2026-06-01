import { Link } from 'react-router-dom';
import { ShieldX, MapPinOff } from 'lucide-react';
import { Button } from './Button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-[#0b1120]">
      <div className="glass-panel max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-500/15">
          <ShieldX className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-300">403</h1>
        <p className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-200">Acceso denegado</p>
        <p className="mt-2 text-sm text-slate-500">No tienes permisos para ver esta sección.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button variant="secondary">Volver al dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-6 dark:bg-[#0b1120]">
      <div className="glass-panel max-w-md rounded-3xl p-10 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800">
          <MapPinOff className="h-8 w-8 text-slate-400" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-300">404</h1>
        <p className="mt-3 text-lg font-semibold text-slate-800 dark:text-slate-200">Página no encontrada</p>
        <p className="mt-2 text-sm text-slate-500">La ruta que buscas no existe en este panel.</p>
        <Link to="/" className="mt-8 inline-block">
          <Button variant="secondary">Volver al inicio</Button>
        </Link>
      </div>
    </div>
  );
}
