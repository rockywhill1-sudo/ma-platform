import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { createClient } from '@/lib/supabase/server';
import { updateUserProfile } from '@/app/actions';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/profile');

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight text-sm">← Back</a>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <PageHeader title="Edit profile" description="Set your name as displayed across the platform" />

        <Card className="p-6 mt-6">
          <form action={updateUserProfile} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">First name</label>
                <input type="text" name="first_name" defaultValue={profile?.first_name ?? ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Last name</label>
                <input type="text" name="last_name" defaultValue={profile?.last_name ?? ''} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Email</label>
              <p className="text-sm text-muted-foreground font-mono">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Email is set at signup and cannot be changed here.</p>
            </div>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Save profile
            </button>
          </form>
        </Card>
      </main>
    </div>
  );
}
