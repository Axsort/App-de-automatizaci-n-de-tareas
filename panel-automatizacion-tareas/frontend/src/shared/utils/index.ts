export function clsx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(date));
}

export const TRIGGER_LABELS: Record<string, string> = {
  TASK_CREATED: 'Tarea creada',
  TASK_OVERDUE: 'Tarea vencida',
  LOW_STOCK: 'Stock bajo',
  ORDER_DELAYED: 'Pedido retrasado',
};

export const ACTION_LABELS: Record<string, string> = {
  CHANGE_STATUS: 'Cambiar estado',
  ASSIGN_RESPONSIBLE: 'Asignar responsable',
  CREATE_NOTIFICATION: 'Crear notificación',
  LOG_AUDIT_EVENT: 'Registrar en auditoría',
};

export const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  OPERATOR: 'Operador',
  VIEWER: 'Visualizador',
};

export const STATUS_COLORS: Record<string, string> = {
  SUCCESS: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  PARTIAL: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};
