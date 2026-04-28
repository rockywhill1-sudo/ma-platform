import { createClient as createSsrClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  let accessToken: string | null = null;
  const allCookies = cookieStore.getAll();
  for (const c of allCookies) {
    if (c.name.startsWith('sb-') && c.name.endsWith('-auth-token')) {
      try {
        let raw = c.value;
        if (raw.startsWith('base64-')) {
          raw = atob(raw.slice(7));
        }
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.access_token === 'string') {
          accessToken = parsed.access_token;
        }
      } catch {}
      break;
    }
  }

  if (accessToken) {
    return createSsrClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: {
          Authorization: 'Bearer ' + accessToken,
        },
      },
    });
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {}
      },
    },
  });
}