import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Eye } from 'lucide-react';
import { automationService } from '../../../shared/services';
import { Button } from '../../../shared/components/Button';
import { Card } from '../../../shared/components/Card';
import { PageLoader } from '../../../shared/components/Spinner';
import { TRIGGER_LABELS, ACTION_LABELS } from '../../../shared/utils';

const conditionSchema = z.object({
  fieldName: z.string().min(1, 'Campo requerido'),
  operator: z.enum(['EQUALS', 'NOT_EQUALS', 'GREATER_THAN', 'LESS_THAN', 'CONTAINS']),
  fieldValue: z.string().min(1, 'Valor requerido'),
});

const actionSchema = z.object({
  actionType: z.enum(['CHANGE_STATUS', 'ASSIGN_RESPONSIBLE', 'CREATE_NOTIFICATION', 'LOG_AUDIT_EVENT']),
  parameters: z.record(z.string(), z.unknown()),
});

const automationSchema = z.object({
  name: z.string().min(1, 'Nombre requerido').max(200),
  description: z.string().max(2000).optional(),
  triggerType: z.enum(['TASK_CREATED', 'TASK_OVERDUE', 'LOW_STOCK', 'ORDER_DELAYED']),
  active: z.boolean(),
  conditions: z.array(conditionSchema),
  actions: z.array(actionSchema).min(1, 'Al menos una acción'),
});

type AutomationForm = z.infer<typeof automationSchema>;

const defaultAction = (): AutomationForm['actions'][0] => ({
  actionType: 'CREATE_NOTIFICATION',
  parameters: { message: '', recipient: '' },
});

export function AutomationFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  const form = useForm<AutomationForm>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      name: '',
      description: '',
      triggerType: 'TASK_CREATED',
      active: true,
      conditions: [],
      actions: [defaultAction()],
    },
  });

  const { fields: conditionFields, append: appendCondition, remove: removeCondition } =
    useFieldArray({ control: form.control, name: 'conditions' });
  const { fields: actionFields, append: appendAction, remove: removeAction } =
    useFieldArray({ control: form.control, name: 'actions' });

  useEffect(() => {
    if (isEdit && id) {
      automationService.getById(Number(id)).then((res) => {
        const a = res.data.data;
        form.reset({
          name: a.name,
          description: a.description || '',
          triggerType: a.triggerType,
          active: a.active,
          conditions: a.conditions.map((c: { fieldName: string; operator: AutomationForm['conditions'][0]['operator']; fieldValue: string }) => ({
            fieldName: c.fieldName,
            operator: c.operator,
            fieldValue: c.fieldValue,
          })),
          actions: a.actions.map((act: { actionType: AutomationForm['actions'][0]['actionType']; parameters: Record<string, unknown> }) => ({
            actionType: act.actionType,
            parameters: act.parameters,
          })),
        });
        setLoading(false);
      });
    }
  }, [id, isEdit, form]);

  const onSubmit = async (data: AutomationForm) => {
    if (isEdit && id) {
      await automationService.update(Number(id), data);
    } else {
      await automationService.create(data);
    }
    navigate('/automations');
  };

  if (loading) return <PageLoader />;

  const values = form.watch();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{isEdit ? 'Editar' : 'Nueva'} automatización</h2>
        <Button variant="secondary" onClick={() => setPreview(!preview)}>
          <Eye className="h-4 w-4" /> {preview ? 'Ocultar' : 'Vista previa'}
        </Button>
      </div>

      {preview && (
        <Card title="Vista previa de la regla">
          <pre className="overflow-auto rounded-lg bg-slate-100 p-4 text-sm dark:bg-slate-800">
            {JSON.stringify({
              si: TRIGGER_LABELS[values.triggerType],
              condiciones: values.conditions,
              entonces: values.actions.map((a) => ACTION_LABELS[a.actionType]),
            }, null, 2)}
          </pre>
        </Card>
      )}

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card title="Información general">
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">Nombre</label>
              <input {...form.register('name')} className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
              {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Descripción</label>
              <textarea {...form.register('description')} rows={2} className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Trigger</label>
              <select {...form.register('triggerType')} className="w-full rounded-lg border px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
                {Object.entries(TRIGGER_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" {...form.register('active')} />
              <span className="text-sm">Activa</span>
            </label>
          </div>
        </Card>

        <Card title="Condiciones" action={
          <Button type="button" variant="secondary" size="sm" onClick={() => appendCondition({ fieldName: '', operator: 'EQUALS', fieldValue: '' })}>
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        }>
          {conditionFields.length === 0 ? (
            <p className="text-sm text-slate-500">Sin condiciones (se ejecutará siempre que ocurra el trigger)</p>
          ) : (
            <div className="space-y-3">
              {conditionFields.map((field, i) => (
                <div key={field.id} className="flex flex-wrap gap-2 rounded-lg border p-3 dark:border-slate-700">
                  <input {...form.register(`conditions.${i}.fieldName`)} placeholder="Campo" className="flex-1 rounded border px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800" />
                  <select {...form.register(`conditions.${i}.operator`)} className="rounded border px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800">
                    <option value="EQUALS">Igual a</option>
                    <option value="NOT_EQUALS">Distinto de</option>
                    <option value="GREATER_THAN">Mayor que</option>
                    <option value="LESS_THAN">Menor que</option>
                    <option value="CONTAINS">Contiene</option>
                  </select>
                  <input {...form.register(`conditions.${i}.fieldValue`)} placeholder="Valor" className="flex-1 rounded border px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800" />
                  <button type="button" onClick={() => removeCondition(i)} className="text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card title="Acciones" action={
          <Button type="button" variant="secondary" size="sm" onClick={() => appendAction(defaultAction())}>
            <Plus className="h-4 w-4" /> Agregar
          </Button>
        }>
          <div className="space-y-3">
            {actionFields.map((field, i) => (
              <div key={field.id} className="rounded-lg border p-3 dark:border-slate-700">
                <div className="flex gap-2">
                  <select {...form.register(`actions.${i}.actionType`)} className="flex-1 rounded border px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-800">
                    {Object.entries(ACTION_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                  <button type="button" onClick={() => removeAction(i)} className="text-red-500" disabled={actionFields.length <= 1}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  defaultValue={JSON.stringify(form.getValues(`actions.${i}.parameters`), null, 2)}
                  onChange={(e) => {
                    try {
                      form.setValue(`actions.${i}.parameters`, JSON.parse(e.target.value));
                    } catch { /* ignore invalid JSON while typing */ }
                  }}
                  rows={3}
                  className="mt-2 w-full rounded border px-2 py-1 font-mono text-xs dark:border-slate-600 dark:bg-slate-800"
                  placeholder='{"key": "value"}'
                />
              </div>
            ))}
          </div>
          {form.formState.errors.actions && <p className="mt-2 text-xs text-red-500">{form.formState.errors.actions.message}</p>}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" loading={form.formState.isSubmitting}>Guardar</Button>
          <Button type="button" variant="secondary" onClick={() => navigate('/automations')}>Cancelar</Button>
        </div>
      </form>
    </div>
  );
}
