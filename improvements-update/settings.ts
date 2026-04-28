import { createClient } from '@/lib/supabase/server';

export type AppSettings = {
  platform_name: string;
  browser_title: string;
  footer_text: string;
  admin_user_ids: string;
};

const DEFAULTS: AppSettings = {
  platform_name: 'M&A Platform',
  browser_title: 'M&A Platform',
  footer_text: '© M&A Platform. All numbers verified against source documents.',
  admin_user_ids: '',
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
  if (!settings.admin_user_ids) return true; // First user = admin if list is empty
  const ids = settings.admin_user_ids.split(',').map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return true;
  return ids.includes(userId);
}
