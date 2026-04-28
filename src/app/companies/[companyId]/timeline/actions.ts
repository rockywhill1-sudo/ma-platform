'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function saveTimeline(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const company_id = String(formData.get('company_id') ?? '');
  const start_date = String(formData.get('start_date') ?? '');
  const current_stage = String(formData.get('current_stage') ?? 'Sourcing');
  const notes = String(formData.get('notes') ?? '');

  if (!company_id || !start_date) return;

  await supabase.from('deal_timelines').upsert({
    company_id,
    start_date,
    current_stage,
    notes,
  }, { onConflict: 'company_id' });

  revalidatePath(`/companies/${company_id}`);
}
