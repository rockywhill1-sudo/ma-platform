import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'edge';

export async function GET() {
  const cookieStore = await cookies();
  const all = cookieStore.getAll();
  const sbCookie = all.find((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

  let extractedToken: string | null = null;
  if (sbCookie) {
    try {
      let raw = sbCookie.value;
      if (raw.startsWith('base64-')) {
        raw = atob(raw.slice(7));
      }
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.access_token === 'string') {
        extractedToken = parsed.access_token;
      } else if (Array.isArray(parsed) && typeof parsed[0] === 'string') {
        extractedToken = parsed[0];
      }
    } catch {}
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { data: who } = await supabase.rpc('whoami');

  const { data: insertResult, error: insertError } = await supabase
    .from('companies')
    .insert({
      name: 'Debug Test ' + Date.now(),
      slug: 'debug-test-' + Date.now(),
      created_by: user?.id ?? null,
    })
    .select('id')
    .single();

  if (insertResult?.id) {
    await supabase.from('companies').delete().eq('id', insertResult.id);
  }

  return NextResponse.json({
    extractedToken: extractedToken ? extractedToken.substring(0, 80) + '...' : null,
    appUserId: user?.id ?? null,
    whoami: who,
    insertError: insertError?.message ?? null,
  });
}