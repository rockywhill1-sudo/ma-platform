'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function createChecklistFromTemplate(formData: FormData) {
  const companyId = formData.get('company_id') as string;
  const templateId = formData.get('template_id') as string;
  if (!companyId || !templateId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: template } = await supabase
    .from('checklist_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  if (!template) return;

  const { data: tasks } = await supabase
    .from('checklist_template_tasks')
    .select('*')
    .eq('template_id', templateId)
    .order('sort_order');

  const { data: existing } = await supabase
    .from('checklists')
    .select('id')
    .eq('company_id', companyId)
    .eq('template_id', templateId)
    .maybeSingle();

  if (existing) return;

  const { data: checklist, error: createError } = await supabase
    .from('checklists')
    .insert({
      company_id: companyId,
      template_id: templateId,
      title: template.title,
    })
    .select('id')
    .single();

  if (createError || !checklist) return;

  if (tasks && tasks.length > 0) {
    const taskRows = tasks.map((t) => ({
      checklist_id: checklist.id,
      template_task_id: t.id,
      title: t.title,
      description: t.description,
      sort_order: t.sort_order,
    }));
    await supabase.from('checklist_tasks').insert(taskRows);
  }

  revalidatePath(`/companies/${companyId}/checklists`);
}

export async function toggleTaskStatus(formData: FormData) {
  const taskId = formData.get('task_id') as string;
  const companyId = formData.get('company_id') as string;
  const newStatus = formData.get('status') as string;
  if (!taskId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const update: any = { status: newStatus };
  if (newStatus === 'done') {
    update.completed_at = new Date().toISOString();
    update.completed_by = user.id;
  } else {
    update.completed_at = null;
    update.completed_by = null;
  }

  await supabase.from('checklist_tasks').update(update).eq('id', taskId);
  revalidatePath(`/companies/${companyId}/checklists`);
}

export async function deleteChecklist(formData: FormData) {
  const checklistId = formData.get('checklist_id') as string;
  const companyId = formData.get('company_id') as string;
  if (!checklistId) return;

  const supabase = await createClient();
  await supabase.from('checklists').delete().eq('id', checklistId);
  revalidatePath(`/companies/${companyId}/checklists`);
}