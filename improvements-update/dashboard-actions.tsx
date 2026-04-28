'use client';

import { useState, useEffect } from 'react';
import { Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  companyName: string;
  ttmRevenue: string;
  ttmEbitda: string;
  ebitdaMargin: string;
  grossMargin: string;
  periodsCount: number;
};

export function DashboardActions(props: Props) {
  const [pmOpen, setPmOpen] = useState(false);
  const [slideIdx, setSlideIdx] = useState(0);

  const slides = [
    {
      title: props.companyName,
      subtitle: 'Investor Briefing',
      body: (
        <div className="space-y-6 mt-12">
          <p className="text-3xl font-light leading-snug max-w-3xl">{props.companyName} financial overview generated from parsed P&amp;L data.</p>
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl font-mono tabular-nums">
            <div><p className="text-xs uppercase tracking-widest text-white/50 mb-1">TTM Revenue</p><p className="text-3xl font-light">{props.ttmRevenue}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-white/50 mb-1">TTM EBITDA</p><p className="text-3xl font-light">{props.ttmEbitda}</p></div>
            <div><p className="text-xs uppercase tracking-widest text-white/50 mb-1">EBITDA Margin</p><p className="text-3xl font-light">{props.ebitdaMargin}</p></div>
          </div>
        </div>
      ),
    },
    {
      title: 'Headline metrics',
      body: (
        <div className="space-y-4 mt-8 max-w-3xl">
          <div className="border-l-2 border-white/20 pl-6 py-2">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">01</p>
            <p className="text-lg leading-relaxed">TTM Revenue: {props.ttmRevenue}</p>
          </div>
          <div className="border-l-2 border-white/20 pl-6 py-2">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">02</p>
            <p className="text-lg leading-relaxed">TTM EBITDA: {props.ttmEbitda} ({props.ebitdaMargin} margin)</p>
          </div>
          <div className="border-l-2 border-white/20 pl-6 py-2">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">03</p>
            <p className="text-lg leading-relaxed">Gross margin: {props.grossMargin}</p>
          </div>
          <div className="border-l-2 border-white/20 pl-6 py-2">
            <p className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">04</p>
            <p className="text-lg leading-relaxed">Built from {props.periodsCount} periods of parsed data</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Next steps',
      body: (
        <div className="space-y-4 mt-12 max-w-3xl">
          <p className="text-2xl font-light leading-relaxed">
            Review Signals page for automated risk detection.
          </p>
          <p className="text-2xl font-light leading-relaxed">
            See Valuation page for indicative range.
          </p>
          <p className="text-2xl font-light leading-relaxed">
            Generate report from Reports page.
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (!pmOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPmOpen(false);
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        setSlideIdx((i) => Math.min(slides.length - 1, i + 1));
      }
      if (e.key === 'ArrowLeft') setSlideIdx((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [pmOpen, slides.length]);

  return (
    <>
      <Button variant="outline" size="md" onClick={() => window.print()}>Export</Button>
      <Button onClick={() => { setSlideIdx(0); setPmOpen(true); }}>
        <Presentation className="h-3.5 w-3.5" /> Presentation Mode
      </Button>

      {pmOpen && (
        <div className="pm-overlay active">
          <div className="pm-slide">
            <div className="mb-8">
              <p className="text-xs font-mono uppercase tracking-widest text-white/50">{slides[slideIdx].subtitle ?? 'Briefing'}</p>
              <h1 className="text-5xl font-light tracking-tight mt-2">{slides[slideIdx].title}</h1>
            </div>
            <div className="flex-1">{slides[slideIdx].body}</div>
          </div>
          <div className="pm-controls">
            <button onClick={() => setSlideIdx((i) => Math.max(0, i - 1))} disabled={slideIdx === 0}>←</button>
            <span className="text-xs text-white/60 font-mono px-2">{slideIdx + 1} / {slides.length}</span>
            <button onClick={() => setSlideIdx((i) => Math.min(slides.length - 1, i + 1))} disabled={slideIdx === slides.length - 1}>→</button>
            <span className="w-px h-4 bg-white/20 mx-1" />
            <button onClick={() => setPmOpen(false)} className="text-xs">Close (Esc)</button>
          </div>
        </div>
      )}
    </>
  );
}
