import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from './Button';

export function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <ShieldX className="mb-4 h-16 w-16 text-red-500" />
      <h1 className="text-4xl font-bold">403</h1>
      <p className="mt-2 text-slate-500">No tiene permisos para acceder a esta página</p>
      <Link to="/" className="mt-6">
        <Button variant="secondary">Volver al dashboard</Button>
      </Link>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 dark:bg-slate-950">
      <h1 className="text-6xl font-bold text-slate-300">404</h1>
      <p className="mt-2 text-slate-500">Página no encontrada</p>
      <Link to="/" className="mt-6">
        <Button variant="secondary">Volver al inicio</Button>
      </Link>
    </div>
  );
}
