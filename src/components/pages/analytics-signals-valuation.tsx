'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { GrowthChart, GmChart, NrrChart, ProjChart } from './charts';
import { DEMO_CONCENTRATION, type DemoSignal } from '@/lib/demo/data';

const SEV_BADGE = {
  high: 'sev-high',
  med: 'sev-med',
  low: 'sev-low',
  positive: 'sev-pos',
};
const SEV_BORDER = {
  high: 'border-destructive',
  med: 'border-warning',
  low: 'border-info',
  positive: 'border-success',
};

export function AnalyticsPage() {
  return (
    <>
      <PageHeader title="Analytics" description="Trends, cohorts, margin and concentration analysis" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Revenue growth</p>
          <h3 className="text-base font-semibold mb-4">YoY % per month</h3>
          <div style={{ height: 240 }}><GrowthChart /></div>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Gross margin</p>
          <h3 className="text-base font-semibold mb-4">Quarterly trend</h3>
          <div style={{ height: 240 }}><GmChart /></div>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Customer concentration</p>
          <h3 className="text-base font-semibold mb-4">Top 5 customers, TTM</h3>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr>
                <th className="text-left py-2">Customer</th>
                <th className="text-right py-2">Revenue</th>
                <th className="text-right py-2">% of total</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {DEMO_CONCENTRATION.map((c, i) => (
                <tr key={c.name} className="row-hover">
                  <td className="py-2 font-medium">{c.name}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{c.rev.toLocaleString()}</td>
                  <td className={`py-2 text-right font-mono tabular-nums ${i === 0 ? 'text-destructive' : ''}`}>{c.pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Net revenue retention</p>
          <h3 className="text-base font-semibold mb-4">Quarterly cohort</h3>
          <div style={{ height: 240 }}><NrrChart /></div>
        </Card>
      </div>
    </>
  );
}

export function SignalsPage({ signals }: { signals: DemoSignal[] }) {
  const counts = signals.reduce((a, s) => { a[s.severity] = (a[s.severity] || 0) + 1; return a; }, {} as Record<string, number>);
  return (
    <>
      <PageHeader
        title="Signals"
        description={`${signals.length} active signals, ${counts.high || 0} high, ${counts.med || 0} med, ${counts.positive || 0} positive`}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-3">
        {signals.map((s) => (
          <Card key={s.id} className={`border-l-4 ${SEV_BORDER[s.severity]} p-5 hover:bg-muted/30`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${SEV_BADGE[s.severity]}`}>
                    {s.severity === 'positive' ? 'Positive' : s.severity}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.category}</span>
                </div>
                <h3 className="font-semibold mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{s.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono tabular-nums">
                  <span>Detected · {s.detected}</span>
                  {s.confidence != null && <span>Confidence · {s.confidence}</span>}
                  {s.cites && <span>Cites · {s.cites}</span>}
                </div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-md border hover:bg-muted shrink-0">Investigate</button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}

export function ValuationPage() {
  const [multiple, setMultiple] = useState(8.5);
  const ttm = 3.106; // M
  const base = ttm * multiple;
  const low = ttm * 7.5;
  const high = ttm * 10;

  const sens = () => {
    const entries = [6, 7, 8, 9, 10];
    const exits = [7, 8, 9, 10, 11];
    return entries.map((en) => ({
      en,
      cells: exits.map((ex) => Math.round((Math.pow((ex / en) * 1.22, 1 / 5) - 1) * 100)),
    }));
  };

  const heatColor = (v: number) => {
    if (v >= 30) return '#bbf7d0';
    if (v >= 20) return '#dcfce7';
    if (v >= 10) return '#fef9c3';
    if (v >= 0) return '#fed7aa';
    return '#fee2e2';
  };

  return (
    <>
      <PageHeader title="Valuation" description="EBITDA-multiple valuation, 5-year projections, IRR sensitivity" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-5 space-y-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Inputs</p>
          <div className="space-y-2">
            <label className="text-sm font-medium">TTM Adj. EBITDA</label>
            <input className="w-full px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums" value="$3,105,672" readOnly />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry multiple</label>
            <div className="flex items-center gap-2">
              <input type="range" min={4} max={14} step={0.5} value={multiple} onChange={(e) => setMultiple(parseFloat(e.target.value))} className="flex-1" />
              <input className="w-20 px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums text-right" value={`${multiple}x`} readOnly />
            </div>
            <p className="text-xs text-muted-foreground">Software, vertical SaaS, $10-25M revenue: median 7.8x, 75th pct 9.4x</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Hold period</label>
            <input className="w-full px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums" value="5 yrs" readOnly />
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Indicative valuation</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Low (7.5x)</p>
                <p className="text-2xl font-semibold tabular-nums">${low.toFixed(1)}M</p>
              </div>
              <div className="border-x px-4">
                <p className="text-xs text-muted-foreground mb-1">Base ({multiple}x)</p>
                <p className="text-2xl font-semibold tabular-nums text-primary">${base.toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">High (10x)</p>
                <p className="text-2xl font-semibold tabular-nums">${high.toFixed(1)}M</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">IRR sensitivity</p>
            <p className="text-xs text-muted-foreground mb-4">Entry × Exit multiple, 5-year hold, 22% CAGR</p>
            <table className="text-xs">
              <thead>
                <tr>
                  <th className="px-3 py-1 text-left text-muted-foreground">Entry / Exit</th>
                  {[7, 8, 9, 10, 11].map((x) => <th key={x} className="px-1 py-1 text-center font-mono">{x}.0x</th>)}
                </tr>
              </thead>
              <tbody>
                {sens().map((row) => (
                  <tr key={row.en}>
                    <td className="px-3 py-1 font-mono text-muted-foreground">{row.en}.0x</td>
                    {row.cells.map((v, i) => (
                      <td key={i} style={{ background: heatColor(v) }} className="heat">{v}%</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">5-year projection</p>
            <h3 className="text-base font-semibold mb-4">Revenue and EBITDA</h3>
            <div style={{ height: 220 }}><ProjChart /></div>
          </Card>
        </div>
      </div>
    </>
  );
}
