'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend,
} from 'recharts';

const TICK = { fontSize: 10, fill: '#737373', fontFamily: 'var(--font-mono)' };

function fmtMoney(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return '$' + Math.round(n / 1_000).toLocaleString() + 'K';
  return '$' + Math.round(n).toLocaleString();
}

function heatColor(v: number): string {
  if (v >= 30) return '#bbf7d0';
  if (v >= 20) return '#dcfce7';
  if (v >= 10) return '#fef9c3';
  if (v >= 0) return '#fed7aa';
  return '#fee2e2';
}

export type RealValuationPageClientProps = {
  ttmEbitda: number;
  ttmRevenue: number;
  hasData: boolean;
};

export function RealValuationPageClient({ ttmEbitda, ttmRevenue, hasData }: RealValuationPageClientProps) {
  const [multiple, setMultiple] = useState(8.5);
  const [growth, setGrowth] = useState(15);
  const [exitMultiple, setExitMultiple] = useState(9);
  const [holdYears, setHoldYears] = useState(5);
  const [exitMargin, setExitMargin] = useState(20);

  if (!hasData || ttmEbitda <= 0) {
    return (
      <>
        <PageHeader
          title="Valuation"
          description="EBITDA-multiple valuation, projections, IRR sensitivity"
        />
        <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-12 text-center">
          <Card className="p-12 max-w-2xl mx-auto">
            <p className="text-base font-medium mb-2">No EBITDA available yet</p>
            <p className="text-sm text-muted-foreground">
              Upload at least 4 quarters of financial data on the Uploads page so we can compute trailing twelve months EBITDA. Once parsed, valuation calculations will appear here.
            </p>
          </Card>
        </div>
      </>
    );
  }

  const baseValue = ttmEbitda * multiple;
  const lowValue = ttmEbitda * (multiple - 1);
  const highValue = ttmEbitda * (multiple + 1.5);

  const projection = [
    { yr: 'Y0', rev: ttmRevenue, ebitda: ttmEbitda },
  ];
  for (let i = 1; i <= holdYears; i++) {
    const yearRev = ttmRevenue * Math.pow(1 + growth / 100, i);
    const currentMarginPct = ttmRevenue > 0 ? (ttmEbitda / ttmRevenue) * 100 : 15;
    const yearMarginPct = currentMarginPct + ((exitMargin - currentMarginPct) * (i / holdYears));
    const yearEbitda = yearRev * (yearMarginPct / 100);
    projection.push({
      yr: `Y${i}`,
      rev: yearRev,
      ebitda: yearEbitda,
    });
  }

  const exitEbitda = projection[projection.length - 1].ebitda;
  const exitValue = exitEbitda * exitMultiple;
  const moic = exitValue / baseValue;
  const irr = baseValue > 0 ? (Math.pow(moic, 1 / holdYears) - 1) * 100 : 0;

  const entries = [Math.round(multiple - 2), Math.round(multiple - 1), Math.round(multiple), Math.round(multiple + 1), Math.round(multiple + 2)];
  const exits = [Math.round(exitMultiple - 2), Math.round(exitMultiple - 1), Math.round(exitMultiple), Math.round(exitMultiple + 1), Math.round(exitMultiple + 2)];
  const sensitivity = entries.map((en) => ({
    en,
    cells: exits.map((ex) => {
      const m = (ex / en) * Math.pow(1 + growth / 100, holdYears);
      return Math.round((Math.pow(m, 1 / holdYears) - 1) * 100);
    }),
  }));

  return (
    <>
      <PageHeader
        title="Valuation"
        description={`Computed from TTM EBITDA of ${fmtMoney(ttmEbitda)}`}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 grid lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-2 p-5 space-y-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Inputs</p>

          <div className="space-y-2">
            <label className="text-sm font-medium">TTM Adj. EBITDA (computed)</label>
            <input className="w-full px-3 py-1.5 rounded-md border bg-muted text-sm font-mono tabular-nums" value={fmtMoney(ttmEbitda)} readOnly />
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
            <label className="text-sm font-medium">Annual revenue growth</label>
            <div className="flex items-center gap-2">
              <input type="range" min={-10} max={50} value={growth} onChange={(e) => setGrowth(parseFloat(e.target.value))} className="flex-1" />
              <input className="w-20 px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums text-right" value={`${growth}%`} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Hold period</label>
            <div className="flex items-center gap-2">
              <input type="range" min={3} max={7} value={holdYears} onChange={(e) => setHoldYears(parseInt(e.target.value))} className="flex-1" />
              <input className="w-20 px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums text-right" value={`${holdYears} yrs`} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exit EBITDA margin</label>
            <div className="flex items-center gap-2">
              <input type="range" min={5} max={45} value={exitMargin} onChange={(e) => setExitMargin(parseFloat(e.target.value))} className="flex-1" />
              <input className="w-20 px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums text-right" value={`${exitMargin}%`} readOnly />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Exit multiple</label>
            <div className="flex items-center gap-2">
              <input type="range" min={4} max={14} step={0.5} value={exitMultiple} onChange={(e) => setExitMultiple(parseFloat(e.target.value))} className="flex-1" />
              <input className="w-20 px-3 py-1.5 rounded-md border bg-background text-sm font-mono tabular-nums text-right" value={`${exitMultiple}x`} readOnly />
            </div>
          </div>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Indicative valuation</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Low ({(multiple - 1).toFixed(1)}x)</p>
                <p className="text-2xl font-semibold tabular-nums">{fmtMoney(lowValue)}</p>
              </div>
              <div className="border-x px-4">
                <p className="text-xs text-muted-foreground mb-1">Base ({multiple.toFixed(1)}x)</p>
                <p className="text-2xl font-semibold tabular-nums text-primary">{fmtMoney(baseValue)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">High ({(multiple + 1.5).toFixed(1)}x)</p>
                <p className="text-2xl font-semibold tabular-nums">{fmtMoney(highValue)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Returns at base case</p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Exit value</p>
                <p className="text-xl font-semibold tabular-nums">{fmtMoney(exitValue)}</p>
              </div>
              <div className="border-x px-4">
                <p className="text-xs text-muted-foreground mb-1">MOIC</p>
                <p className="text-xl font-semibold tabular-nums">{moic.toFixed(2)}x</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">IRR</p>
                <p className="text-xl font-semibold tabular-nums text-success">{irr.toFixed(1)}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">IRR sensitivity</p>
            <p className="text-xs text-muted-foreground mb-4">Entry × Exit multiple, {holdYears}-year hold, {growth}% growth</p>
            <div className="overflow-x-auto">
              <table className="text-xs">
                <thead>
                  <tr>
                    <th className="px-3 py-1 text-left text-muted-foreground">Entry / Exit</th>
                    {exits.map((x) => <th key={x} className="px-1 py-1 text-center font-mono">{x}.0x</th>)}
                  </tr>
                </thead>
                <tbody>
                  {sensitivity.map((row) => (
                    <tr key={row.en}>
                      <td className="px-3 py-1 font-mono text-muted-foreground">{row.en}.0x</td>
                      {row.cells.map((v, i) => (
                        <td key={i} style={{ background: heatColor(v) }} className="inline-block w-12 text-center py-1.5 font-mono text-xs tabular-nums">{v}%</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{holdYears}-year projection</p>
            <h3 className="text-base font-semibold mb-4">Revenue and EBITDA</h3>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projection.map((p) => ({ ...p, rev: p.rev / 1_000_000, ebitda: p.ebitda / 1_000_000 }))} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="yr" tick={{ ...TICK, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={TICK} tickFormatter={(v) => '$' + v.toFixed(1) + 'M'} axisLine={false} tickLine={false} width={55} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 4 }} formatter={(v: number) => '$' + v.toFixed(2) + 'M'} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="rev" fill="#3D5A80" name="Revenue" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="ebitda" fill="#16a34a" name="EBITDA" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
