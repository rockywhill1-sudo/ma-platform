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

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

export async function createCompany(_p: any, formData: FormData) {
  const parsed = Schema.safeParse({
    name: formData.get('name'),
    industry: formData.get('industry'),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return { error: 'Not signed in' };

  const baseSlug = slugify(parsed.data.name) || 'company';
  let slug = baseSlug;
  for (let i = 0; i < 5; i++) {
    const existingResult = await supabase.from('companies').select('id').eq('slug', slug).maybeSingle();
    if (!existingResult.data) break;
    slug = baseSlug + '-' + Math.random().toString(36).slice(2, 6);
  }

  const insertResult = await supabase
    .from('companies')
    .insert({
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry || null,
      created_by: user.id,
    })
    .select('id')
    .single();

  if (insertResult.error || !insertResult.data) {
    return { error: insertResult.error?.message ?? 'Failed' };
  }

  await supabase.from('company_users').insert({
    company_id: insertResult.data.id,
    user_id: user.id,
    role: 'owner',
    added_by: user.id,
  });

  revalidatePath('/', 'layout');
  redirect('/companies/' + insertResult.data.id + '/dashboard');
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
  'platform_name',
  'platform_tagline',
  'browser_title',
  'footer_text',
  'admin_user_ids',
  'logo_url',
  'color_theme',
  'hero_headline',
  'hero_headline_2',
  'hero_subheadline',
  'hero_demo_button',
  'hero_signup_button',
  'hero_subtext',
  'nav_demo_link',
  'nav_signin_link',
  'nav_signup_link',
];

export async function updateAppSettings(formData: FormData) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) return;

  for (const key of SETTINGS_KEYS) {
    const v = formData.get(key);
    if (v != null) {
      await supabase.from('app_settings').upsert(
        { key, value: String(v) },
        { onConflict: 'key' }
      );
    }
  }

  revalidatePath('/', 'layout');
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  const user = auth.data.user;
  if (!user) return;

  const first_name = String(formData.get('first_name') ?? '').trim();
  const last_name = String(formData.get('last_name') ?? '').trim();
  const full_name_raw = first_name + ' ' + last_name;
  const full_name = full_name_raw.trim() || null;

  const existingResult = await supabase
    .from('user_profiles')
    .select('id, user_id')
    .or('id.eq.' + user.id + ',user_id.eq.' + user.id)
    .maybeSingle();

  if (existingResult.data) {
    await supabase
      .from('user_profiles')
      .update({ first_name, last_name, full_name, user_id: user.id })
      .eq('id', existingResult.data.id);
  } else {
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

export async function inviteTeamMember(formData: FormData) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) return;

  const company_id = String(formData.get('company_id') ?? '');
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const role = String(formData.get('role') ?? 'viewer');

  if (!company_id || !email) return;

  await supabase.from('workspace_invites').insert({
    company_id,
    email,
    role,
    invited_by: auth.data.user.id,
    status: 'pending',
  });

  revalidatePath('/companies/' + company_id + '/admin');
}

export async function emailReport(formData: FormData) {
  const supabase = await createClient();
  const auth = await supabase.auth.getUser();
  if (!auth.data.user) return;

  const reportId = String(formData.get('report_id') ?? '');
  const recipientEmail = String(formData.get('recipient_email') ?? '').trim();
  const recipientNameRaw = String(formData.get('recipient_name') ?? '').trim();
  const recipientName = recipientNameRaw || 'there';
  const note = String(formData.get('note') ?? '').trim();

  if (!reportId || !recipientEmail) return;

  const reportResult = await supabase
    .from('reports')
    .select('id, title, kind, company_id')
    .eq('id', reportId)
    .single();

  const report = reportResult.data;
  if (!report) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mergers.neaigroup.com';
  const reportUrl = siteUrl + '/companies/' + report.company_id + '/reports/' + reportId;

  try {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL ?? 'info@neaigroup.com';
    const senderName = process.env.BREVO_SENDER_NAME ?? 'M&A Platform';
    if (!apiKey) return;

    let noteHtml = '';
    if (note) {
      noteHtml = '<p style="color: #475569; line-height: 1.6;">' + note.replace(/\n/g, '<br>') + '</p>';
    }

    const html =
      '<div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; padding: 24px;">' +
      '<h2 style="margin: 0 0 16px; font-size: 20px;">' + report.title + '</h2>' +
      '<p style="color: #475569; line-height: 1.6;">Hi ' + recipientName + ',</p>' +
      noteHtml +
      '<p style="color: #475569; line-height: 1.6;">Click the button below to view the report.</p>' +
      '<p style="margin: 24px 0;">' +
      '<a href="' + reportUrl + '" style="background: #4f46e5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">View report</a>' +
      '</p>' +
      '<p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">Sent via M&A Platform.</p>' +
      '</div>';

    const body = {
      sender: { email: senderEmail, name: senderName },
      to: [{ email: recipientEmail, name: recipientName }],
      subject: report.title,
      htmlContent: html,
    };

    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    // ignore
  }

  redirect('/companies/' + report.company_id + '/reports/' + reportId + '?emailed=1');
}
