'use server';

import { z } from 'zod';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail, upsertContact } from '@/lib/brevo';

const Schema = z.object({
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type SignupState = { error?: string } | null;

export async function signup(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = Schema.safeParse({
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Invalid input' };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.fullName } },
  });
  if (error) return { error: error.message };

  // Fire-and-forget Brevo, do not fail signup if Brevo is down
  try {
    await Promise.all([
      sendWelcomeEmail(parsed.data.email, parsed.data.fullName),
      upsertContact(parsed.data.email, { FIRSTNAME: parsed.data.fullName.split(' ')[0], LASTNAME: parsed.data.fullName.split(' ').slice(1).join(' ') }),
    ]);
  } catch (e) {
    console.error('Brevo error during signup:', e);
  }

  redirect('/');
}
