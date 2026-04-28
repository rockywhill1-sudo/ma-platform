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
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  for (const c of all) {
    if (c.name.startsWith('sb-')) {
      try { cookieStore.delete(c.name); } catch {}
    }
  }
  redirect('/login');
}

const SETTINGS_KEYS = [
  'platform_name', 'platform_tagline', 'browser_title', 'footer_text', 'admin_user_ids', 'logo_url', 'color_theme',
  'hero_headline', 'hero_headline_2', 'hero_subheadline',
  'hero_demo_button', 'hero_signup_button', 'hero_subtext',
  'nav_demo_link', 'nav_signin_link', 'nav_signup_link',
];

export async function updateAppSettings(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  for (const key of SETTINGS_KEYS) {
    const v = formData.get(key);
    if (v != null) {
      await supabase.from('app_settings').upsert({ key, value: String(v) }, { onConflict: 'key' });
    }
  }

  revalidatePath('/', 'layout');
}

/**
 * Profile save - works around legacy schema by writing to BOTH
 * the legacy `id` row and the new `user_id` column.
 */
export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const first_name = String(formData.get('first_name') ?? '').trim();
  const last_name = String(formData.get('last_name') ?? '').trim();
  const full_name = (first_name + ' ' + last_name).trim() || null;

  // Check if a row exists for this user (by id OR user_id)
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id, user_id')
    .or(`id.eq.${user.id},user_id.eq.${user.id}`)
    .maybeSingle();

  if (existing) {
    // Update existing row
    await supabase
      .from('user_profiles')
      .update({
        first_name,
        last_name,
        full_name,
        user_id: user.id,
      })
      .eq('id', existing.id);
  } else {
    // Insert new row with both id and user_id set to user.id
    await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        user_id: user.id,
        email: user.email,
        first_name,
        last_name,
        full_name,
      });
  }

  revalidatePath('/', 'layout');
  redirect('/');
}

export async function uploadLogo(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not signed in' };

  const file = formData.get('logo') as File | null;
  if (!file || file.size === 0) return { error: 'No file' };
  if (file.size > 2 * 1024 * 1024) return { error: 'File too large (max 2MB)' };

  // Generate unique key
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const key = `logos/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Upload to R2 via internal API endpoint
  // Since the R2 binding is only available on Workers runtime and not in actions,
  // we POST to our own /api/upload-logo endpoint
  const arrayBuffer = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergers.neaigroup.com';
  try {
    const res = await fetch(`${siteUrl}/api/upload-logo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, contentType: file.type, base64 }),
    });
    if (!res.ok) return { error: 'Upload failed' };
    const { url } = await res.json();

    await supabase.from('app_settings').upsert(
      { key: 'logo_url', value: url },
      { onConflict: 'key' }
    );

    revalidatePath('/', 'layout');
    return { success: true, url };
  } catch (e: any) {
    return { error: e?.message ?? 'Upload failed' };
  }
}

export async function inviteTeamMember(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const company_id = String(formData.get('company_id') ?? '');
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role') ?? 'viewer');

  if (!company_id || !email) return;

  await supabase.from('workspace_invites').insert({
    company_id,
    email,
    role,
    invited_by: user.id,
    status: 'pending',
  });

  revalidatePath(`/companies/${company_id}/admin`);
}

export async function emailReport(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const reportId = String(formData.get('report_id') ?? '');
  const recipientEmail = String(formData.get('recipient_email') ?? '').trim();
  const recipientName = String(formData.get('recipient_name') ?? '').trim() || 'there';
  const note = String(formData.get('note') ?? '').trim();

  if (!reportId || !recipientEmail) return;

  const { data: report } = await supabase
    .from('reports')
    .select('id, title, kind, company_id')
    .eq('id', reportId)
    .single();
  if (!report) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergers.neaigroup.com';
  const reportUrl = `${siteUrl}/companies/${report.company_id}/reports/${reportId}`;

  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'info@neaigroup.com';
    const senderName = process.env.BREVO_SENDER_NAME ?? 'M&A Platform';
    if (!apiKey) return;

    const body = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: report.title,
      htmlContent: `<div style="font-family: -apple-system, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 16px; font-size: 20px;">${report.title}</h2>
        <p style="color: #475569; line-height: 1.6;">Hi ${recipientName},</p>
        ${note ? `<p style="color: #475569; line-height: 1.6;">${note.replace(/\n/g, '<br>')}</p>` : ''}
        <p style="color: #475569; line-height: 1.6;">Click the button below to view the report.</p>
        <p style="margin: 24px 0;"><a href="${reportUrl}" style="background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">View report</a></p>
        <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Sent via M&A Platform.</p>
      </div>`,
    };

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: { 'api-key': apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore
  }

  redirect(`/companies/${report.company_id}/reports/${reportId}?emailed=1`);
}
export async function deleteWorkspace(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const company_id = String(formData.get('company_id') ?? '');
  const confirm_name = String(formData.get('confirm_name') ?? '').trim();

  if (!company_id || !confirm_name) return;

  // Verify the typed name matches the workspace name
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', company_id)
    .single();

  if (!company) return;
  if (company.name !== confirm_name) return;

  // Delete the company - cascades to all related tables
  await supabase.from('companies').delete().eq('id', company_id);

  // Redirect to first remaining workspace, or new workspace page
  const { data: remaining } = await supabase
    .from('companies')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1);

  revalidatePath('/', 'layout');

  if (remaining && remaining.length > 0) {
    redirect(`/companies/${remaining[0].id}/dashboard`);
  } else {
    redirect('/companies/new');
  }
}
