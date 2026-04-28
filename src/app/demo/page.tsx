'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AppShell } from '@/components/layout/shell';
import { DashboardPage } from '@/components/pages/dashboard-page';
import { FinancialsPage } from '@/components/pages/financials-page';
import { AnalyticsPage, SignalsPage, ValuationPage } from '@/components/pages/analytics-signals-valuation';
import { ChecklistsPage, ReportsPage, IntegrationsPage, AdminPage } from '@/components/pages/checklists-reports-integrations-admin';
import { UploadsPage } from '@/components/pages/uploads-page';
import { DEMO_USER, DEMO_COMPANY, DEMO_COMPANIES, DEMO_SIGNALS, DEMO_UPLOADS } from '@/lib/demo/data';

const SLIDES = [
  {
    title: 'NeuralEdge AI Group',
    subtitle: 'Quarterly Investor Briefing, Q1 2026',
    body: `<div class="space-y-6 mt-12">
      <p class="text-3xl font-light leading-snug max-w-3xl">Vertical SaaS for AI-native life-sciences workflows.</p>
      <div class="grid grid-cols-3 gap-8 mt-16 max-w-2xl font-mono tabular-nums">
        <div><p class="text-xs uppercase tracking-widest text-white/50 mb-1">TTM Rev</p><p class="text-3xl font-light">$14.2M</p></div>
        <div><p class="text-xs uppercase tracking-widest text-white/50 mb-1">EBITDA</p><p class="text-3xl font-light">$3.1M</p></div>
        <div><p class="text-xs uppercase tracking-widest text-white/50 mb-1">NRR</p><p class="text-3xl font-light">124%</p></div>
      </div></div>`,
  },
  {
    title: 'Executive Summary',
    body: `<div class="space-y-4 mt-8 max-w-3xl">
      <div class="border-l-2 border-white/20 pl-6 py-2"><p class="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">01</p><p class="text-lg leading-relaxed">28.4% YoY revenue growth driven by net retention and net new logos.</p></div>
      <div class="border-l-2 border-white/20 pl-6 py-2"><p class="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">02</p><p class="text-lg leading-relaxed">EBITDA margin held at ~22% despite Q4 COGS pressure from AI inference costs.</p></div>
      <div class="border-l-2 border-white/20 pl-6 py-2"><p class="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">03</p><p class="text-lg leading-relaxed">Customer concentration is the primary diligence risk, top customer at 18.4%.</p></div>
      <div class="border-l-2 border-white/20 pl-6 py-2"><p class="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">04</p><p class="text-lg leading-relaxed">Indicative valuation $23.3M to $31.1M (8.5x mid).</p></div>
    </div>`,
  },
];

const PAGES = ['dashboard', 'financials', 'analytics', 'signals', 'valuation', 'checklists', 'reports', 'uploads', 'integrations', 'admin', 'references'] as const;
type Page = typeof PAGES[number];

function pageFromPath(pathname: string): Page {
  const parts = pathname.split('/').filter(Boolean);
  // /demo or /demo/X
  if (parts.length < 2) return 'dashboard';
  const slug = parts[1] as Page;
  if (PAGES.includes(slug)) return slug;
  return 'dashboard';
}

export default function DemoPage() {
  const pathname = usePathname();
  const [page, setPage] = useState<Page>(() => pageFromPath(pathname));
  const [pmOpen, setPmOpen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  // Sync state with URL when path changes (browser back/forward)
  useEffect(() => {
    setPage(pageFromPath(pathname));
  }, [pathname]);

  // Intercept link clicks to /demo/X to update state without full page navigation
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a[href^="/demo/"], a[href="/demo"]') as HTMLAnchorElement | null;
      if (!target) return;
      // Only intercept internal demo links (not external)
      const href = target.getAttribute('href') || '';
      const slug = href === '/demo' ? 'dashboard' : (href.split('/').pop() as Page);
      if (PAGES.includes(slug as Page) || slug === 'dashboard') {
        e.preventDefault();
        setPage(slug as Page);
        // Update browser URL silently for shareability
        window.history.pushState({}, '', href === '/demo' ? '/demo' : `/demo/${slug}`);
      }
    };
    document.addEventListener('click', handler);

    const kbd = (e: KeyboardEvent) => {
      if (pmOpen) {
        if (e.key === 'Escape') setPmOpen(false);
        if (e.key === 'ArrowRight' || e.key === ' ') setSlideIdx((i) => Math.min(SLIDES.length - 1, i + 1));
        if (e.key === 'ArrowLeft') setSlideIdx((i) => Math.max(0, i - 1));
      }
    };
    document.addEventListener('keydown', kbd);

    // Listen to back/forward navigation
    const popState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', popState);

    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('keydown', kbd);
      window.removeEventListener('popstate', popState);
    };
  }, [pmOpen]);

  const slide = SLIDES[slideIdx];

  return (
    <>
      <AppShell currentCompany={DEMO_COMPANY} companies={DEMO_COMPANIES} user={DEMO_USER} demo>
        {page === 'dashboard' && <DashboardPage companyName={DEMO_COMPANY.name} signals={DEMO_SIGNALS} onPresent={() => { setSlideIdx(0); setPmOpen(true); }} />}
        {page === 'financials' && <FinancialsPage />}
        {page === 'analytics' && <AnalyticsPage />}
        {page === 'signals' && <SignalsPage signals={DEMO_SIGNALS} />}
        {page === 'valuation' && <ValuationPage />}
        {page === 'checklists' && <ChecklistsPage />}
        {page === 'reports' && <ReportsPage />}
        {page === 'uploads' && <UploadsPage uploads={DEMO_UPLOADS as any} readOnly />}
        {page === 'integrations' && <IntegrationsPage />}
        {page === 'admin' && <AdminPage companyName={DEMO_COMPANY.name} userName="Rocky Hill" userEmail="rocky.hill@almcoe.online" />}
        {page === 'references' && <DemoReferencesNotice />}
      </AppShell>

      <div className={`pm-overlay ${pmOpen ? 'active' : ''}`}>
        <div className="pm-slide">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-white/40 mb-12">
            <span>NeuralEdge AI Group</span>
            <span>{slide?.title}</span>
            <span>{slideIdx + 1} of {SLIDES.length}</span>
          </div>
          {slide?.subtitle && <p className="text-xs uppercase tracking-widest text-white/50 mb-2 font-mono">{slide.subtitle}</p>}
          <h2 className="text-5xl font-light tracking-tight">{slide?.title}</h2>
          <div dangerouslySetInnerHTML={{ __html: slide?.body || '' }} />
        </div>
        <div className="pm-controls">
          <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))}>←</button>
          <span className="font-mono text-xs text-white/70">{slideIdx + 1} / {SLIDES.length}</span>
          <button onClick={() => setSlideIdx((i) => Math.min(SLIDES.length - 1, i + 1))}>→</button>
          <span className="text-white/30 text-xs">·</span>
          <button onClick={() => setPmOpen(false)} className="text-xs">Exit (Esc)</button>
        </div>
      </div>
    </>
  );
}

function DemoReferencesNotice() {
  return (
    <div className="flex-1 max-w-3xl mx-auto px-6 py-24 text-center">
      <p className="text-sm text-muted-foreground">
        M&amp;A References are available in the live platform. <a href="/signup" className="text-indigo-600 underline">Sign up</a> to see the full glossary, formulas, and deal stage reference.
      </p>
    </div>
  );
}
