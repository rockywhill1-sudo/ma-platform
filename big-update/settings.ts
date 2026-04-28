import 'server-only';
import { createClient } from '@/lib/supabase/server';

export type AppSettings = {
  platform_name: string;
  browser_title: string;
  footer_text: string;
  admin_user_ids: string;
  logo_url: string;
  hero_headline: string;
  hero_headline_2: string;
  hero_subheadline: string;
  hero_demo_button: string;
  hero_signup_button: string;
  hero_subtext: string;
  nav_demo_link: string;
  nav_signin_link: string;
  nav_signup_link: string;
};

const DEFAULTS: AppSettings = {
  platform_name: 'M&A Platform',
  browser_title: 'M&A Platform',
  footer_text: '© M&A Platform. All numbers verified against source documents.',
  admin_user_ids: '',
  logo_url: '',
  hero_headline: 'Investor-grade M&A intelligence,',
  hero_headline_2: 'for every stage of the deal.',
  hero_subheadline: 'Connect accounting systems or upload financials directly. Get normalized P&L, anomaly detection, signals, and investor-grade reports automatically.',
  hero_demo_button: 'Try the demo',
  hero_signup_button: 'Get started',
  hero_subtext: 'No credit card required',
  nav_demo_link: 'Demo',
  nav_signin_link: 'Sign in',
  nav_signup_link: 'Sign up',
};

export async function getAppSettings(): Promise<AppSettings> {
  try {
    const supabase = await createClient();
    const { data } = await supabase.from('app_settings').select('key, value');
    const settings = { ...DEFAULTS };
    if (data) {
      for (const row of data) {
        if (row.key in settings) {
          (settings as any)[row.key] = row.value ?? (DEFAULTS as any)[row.key];
        }
      }
    }
    return settings;
  } catch {
    return DEFAULTS;
  }
}

export async function isAppAdmin(userId: string | undefined | null): Promise<boolean> {
  if (!userId) return false;
  const settings = await getAppSettings();
  if (!settings.admin_user_ids) return true;
  const ids = settings.admin_user_ids.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return true;
  return ids.includes(userId);
}

export type UserDisplay = {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
};

export async function getUserDisplay(userId: string | undefined | null): Promise<UserDisplay | null> {
  if (!userId) return null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.id !== userId) return null;

    const { data } = await supabase
      .from('user_profiles')
      .select('first_name, last_name')
      .eq('user_id', userId)
      .maybeSingle();

    const first_name = (data?.first_name ?? '').trim();
    const last_name = (data?.last_name ?? '').trim();
    let full_name = (first_name + ' ' + last_name).trim();
    if (!full_name) full_name = user.email?.split('@')[0] ?? 'User';

    return {
      user_id: userId,
      email: user.email ?? '',
      first_name,
      last_name,
      full_name,
    };
  } catch {
    return null;
  }
}
