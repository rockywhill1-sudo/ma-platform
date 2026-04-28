import { redirect } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Activity, BarChart3, FileText, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '@/lib/settings';

export default async function RootPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: companies } = await supabase
      .from('companies').select('id').order('created_at', { ascending: true }).limit(1);
    if (companies && companies.length > 0) redirect(`/companies/${companies[0].id}/dashboard`);
    redirect('/companies/new');
  }

  const s = await getAppSettings();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b backdrop-blur bg-white/70 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {s.logo_url ? (
              <Image src={s.logo_url} alt={s.platform_name} width={28} height={28} className="rounded-md object-contain" />
            ) : (
              <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-600 to-blue-500" />
            )}
            <span className="font-semibold tracking-tight">{s.platform_name}</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/demo" className="text-slate-600 hover:text-slate-900 transition-colors">{s.nav_demo_link}</Link>
            <Link href="/login" className="text-slate-600 hover:text-slate-900 transition-colors">{s.nav_signin_link}</Link>
            <Link href="/signup" className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 text-white font-medium hover:opacity-90 shadow-sm">{s.nav_signup_link}</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl" />
          <div className="absolute top-32 right-1/4 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-6 py-20 lg:py-28 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-xs font-medium text-indigo-700">Built for serious M&amp;A operators</span>
          </div>
          <h1 className="text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.1] mb-6">
            <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">{s.hero_headline}</span><br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent">{s.hero_headline_2}</span>
          </h1>
          <p className="text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8">{s.hero_subheadline}</p>
          <div className="flex items-center justify-center gap-3 mb-3">
            <Link href="/demo" className="h-11 px-6 inline-flex items-center rounded-md border-2 border-slate-200 bg-white text-sm font-medium hover:border-slate-400 transition-colors shadow-sm">{s.hero_demo_button}</Link>
            <Link href="/signup" className="h-11 px-6 inline-flex items-center rounded-md bg-gradient-to-r from-indigo-600 to-blue-500 text-white text-sm font-medium hover:opacity-90 shadow-md hover:shadow-lg transition-shadow">{s.hero_signup_button}</Link>
          </div>
          <p className="text-xs text-slate-500 font-mono">{s.hero_subtext}</p>
        </div>
      </section>

      {/* Three columns: Parse / Analyze / Report */}
      <section className="py-16 lg:py-24 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs font-mono uppercase tracking-widest text-indigo-600 mb-2">How it works</p>
            <h2 className="text-3xl font-semibold tracking-tight">From raw P&amp;L to investor-ready in minutes</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: BarChart3, title: 'Parse any P&L', desc: 'Drop financials from QuickBooks, Xero, Sage, or NetSuite. We auto-detect periods, categorize accounts, and normalize to consistent line items.', color: 'from-blue-500 to-cyan-500' },
              { icon: Activity, title: 'Detect signals automatically', desc: 'Margin compression, revenue acceleration, customer concentration, working capital deterioration. Each signal includes evidence and confidence.', color: 'from-indigo-500 to-purple-500' },
              { icon: FileText, title: 'Generate investor reports', desc: 'Quality of Earnings, Diligence Summary, Investor Brief, Valuation Memo. Export to PDF or share via link.', color: 'from-emerald-500 to-teal-500' },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:border-slate-300 transition-all">
                <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${f.color} grid place-items-center text-white mb-4 shadow-md`}>
                  <f.icon className="h-5 w-5" strokeWidth={2} />
                </div>
                <h3 className="font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / value props */}
      <section className="py-16 lg:py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <p className="text-4xl font-semibold tabular-nums bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2">15+</p>
              <p className="text-sm text-slate-600">Diligence signals detected automatically</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <p className="text-4xl font-semibold tabular-nums bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2">5</p>
              <p className="text-sm text-slate-600">Standard diligence workflows pre-built</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-8">
              <p className="text-4xl font-semibold tabular-nums bg-gradient-to-r from-indigo-600 to-blue-500 bg-clip-text text-transparent mb-2">{'<5min'}</p>
              <p className="text-sm text-slate-600">From P&amp;L upload to dashboard</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <ShieldCheck className="h-12 w-12 mx-auto mb-6 opacity-90" strokeWidth={1.5} />
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-4">Built for the diligence loop you already run.</h2>
          <p className="text-lg opacity-90 leading-relaxed mb-8 max-w-2xl mx-auto">No more spreadsheets passed by email. No more re-keying numbers. Just upload, analyze, and ship.</p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/demo" className="h-11 px-6 inline-flex items-center rounded-md bg-white/10 border border-white/20 text-sm font-medium hover:bg-white/20 transition-colors backdrop-blur">{s.hero_demo_button}</Link>
            <Link href="/signup" className="h-11 px-6 inline-flex items-center rounded-md bg-white text-indigo-700 text-sm font-medium hover:bg-slate-50 shadow-lg">{s.hero_signup_button}</Link>
          </div>
        </div>
      </section>

      <footer className="border-t bg-white py-6 px-6">
        <div className="text-xs text-slate-500 text-center space-y-1">
          <p>{s.footer_text}</p>
          <p><Link href="/disclaimer" className="hover:underline">Legal disclaimer &amp; ownership</Link></p>
        </div>
      </footer>
    </div>
  );
}
