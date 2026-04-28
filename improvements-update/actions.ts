'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const Schema = z.object({
  name: z.string().min(1).max(200),
  industry: z.string().max(100).optional().or(z.literal('')),
});

const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);

export async function createCompany(_p: any, formData: FormData) {
  const parsed = Schema.safeParse({
    name: formData.get('name'),
    industry: formData.get('industry'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const baseSlug = slugify(parsed.data.name) || 'company';
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const { data: existing } = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry || null,
      created_by: user.id,
    })
    .select('id').single();
  if (error || !company) return { error: error?.message ?? 'Failed' };

  await supabase.from('company_users').insert({
    company_id: company.id,
    user_id: user.id,
    role: 'owner',
    added_by: user.id,
  });

  revalidatePath('/', 'layout');
  redirect(`/companies/${company.id}/dashboard`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();

  // Explicitly clear all Supabase cookies
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  for (const c of all) {
    if (c.name.startsWith('sb-')) {
      try {
        cookieStore.delete(c.name);
      } catch {}
    }
  }

  redirect('/login');
}

export async function updateAppSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const updates: { key: string; value: string }[] = [];
  for (const key of ['platform_name', 'browser_title', 'footer_text', 'admin_user_ids']) {
    const v = formData.get(key);
    if (v != null) updates.push({ key, value: String(v) });
  }

  for (const u of updates) {
    await supabase
      .from('app_settings')
      .upsert({ key: u.key, value: u.value }, { onConflict: 'key' });
  }

  revalidatePath('/', 'layout');
}
