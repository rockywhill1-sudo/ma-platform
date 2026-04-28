import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '@/lib/settings';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: companies } = await supabase
      .from('companies')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);
    if (companies && companies.length > 0) {
      redirect(`/companies/${companies[0].id}/dashboard`);
    }
    redirect('/companies/new');
  }

  const s = await getAppSettings();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded-sm bg-primary" />
            <span className="font-semibold tracking-tight text-sm">{s.platform_name}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/demo" className="text-muted-foreground hover:text-foreground">{s.nav_demo_link}</Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">{s.nav_signin_link}</Link>
            <Link href="/signup" className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-medium hover:opacity-90">{s.nav_signup_link}</Link>
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center">
        <div className="max-w-3xl mx-auto px-6 py-24 text-center space-y-8">
          <h1 className="text-5xl font-semibold tracking-tight leading-tight">
            {s.hero_headline}<br />{s.hero_headline_2}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
            {s.hero_subheadline}
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/demo" className="h-10 px-5 inline-flex items-center rounded-md border bg-background text-sm font-medium hover:bg-muted">{s.hero_demo_button}</Link>
            <Link href="/signup" className="h-10 px-5 inline-flex items-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">{s.hero_signup_button}</Link>
          </div>
          <p className="text-xs text-muted-foreground font-mono">{s.hero_subtext}</p>
        </div>
      </main>
      <footer className="border-t py-3 px-6">
        <p className="text-xs text-muted-foreground text-center">{s.footer_text}</p>
      </footer>
    </div>
  );
}
