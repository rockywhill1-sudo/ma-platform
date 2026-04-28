import { NextResponse } from 'next/server';
import { upsertContact } from '@/lib/brevo';
import { z } from 'zod';

const Schema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = Schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid email' }, { status: 400 });

    await upsertContact(parsed.data.email, parsed.data.name ? { FIRSTNAME: parsed.data.name } : undefined);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Subscribe failed' }, { status: 500 });
  }
}
