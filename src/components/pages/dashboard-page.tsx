'use client';

import { TrendingUp, TrendingDown, Presentation } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/layout/shell';
import { RevChart } from './charts';
import type { DemoSignal } from '@/lib/demo/data';

const SEV_COLORS = {
  high: 'border-destructive sev-high',
  med: 'border-warning sev-med',
  low: 'border-info sev-low',
  positive: 'border-success sev-pos',
};

const PROGRESS = [
  { label: 'Quality of Earnings', done: 14, total: 18 },
  { label: 'Legal & Corporate', done: 9, total: 22 },
  { label: 'Commercial diligence', done: 6, total: 15 },
  { label: 'Tech & security', done: 2, total: 12 },
];

const ACTIVITY = [
  { color: 'bg-success', title: 'QBO sync completed, 2h ago', sub: 'Pulled 1,847 GL entries, 3 new customers' },
  { color: 'bg-info', title: 'New signal: Customer concentration, 4h ago', sub: 'Helix Bio crossed 18% threshold' },
  { color: 'bg-muted-foreground', title: 'Report generated: Q4 QoE Summary, yesterday', sub: 'By Rocky Hill, 22 pages' },
  { color: 'bg-muted-foreground', title: 'Checklist item completed, 2d ago', sub: '"Verify revenue recognition policy"' },
];

export function DashboardPage({
  companyName, signals, onPresent,
}: {
  companyName: string;
  signals: DemoSignal[];
  onPresent?: () => void;
}) {
  const top = signals.slice(0, 4);

  return (
    <>
      <PageHeader
        eyebrow={companyName}
        title="Dashboard"
        description="TTM through Mar 2026, QuickBooks Online, last sync 2h ago"
        actions={
          <>
            <Button variant="outline" size="md">Export</Button>
            {onPresent && (
              <Button onClick={onPresent}>
                <Presentation className="h-3.5 w-3.5" /> Presentation Mode
              </Button>
            )}
          </>
        }
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'TTM Revenue', value: '$14.2M', delta: '+28.4% YoY', up: true },
            { label: 'Adj. EBITDA', value: '$3.11M', delta: '21.9% margin', up: true },
            { label: 'Gross Margin', value: '42.8%', delta: '-180 bps QoQ', up: false },
            { label: 'Cash Runway', value: '14.2 mo', delta: '$2.4M cash, burn $169K', up: null },
          ].map((k) => (
            <Card key={k.label} className="p-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">{k.label}</p>
              <p className="text-2xl font-semibold tabular-nums tracking-tight">{k.value}</p>
              <p className={`text-xs mt-1 tabular-nums flex items-center gap-1 ${k.up === true ? 'text-success' : k.up === false ? 'text-destructive' : 'text-muted-foreground'}`}>
                {k.up === true && <TrendingUp className="h-3 w-3" />}
                {k.up === false && <TrendingDown className="h-3 w-3" />}
                {k.delta}
              </p>
            </Card>
          ))}
        </div>

        {/* Revenue + signals */}
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Revenue, last 24 months</p>
                <h3 className="text-base font-semibold tracking-tight">Monthly recurring</h3>
              </div>
            </div>
            <div style={{ height: 280 }}><RevChart /></div>
          </Card>

          <Card className="p-5">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Top signals</p>
              <a href="signals" className="text-xs text-primary hover:underline">View all {signals.length}</a>
            </div>
            <div className="space-y-3">
              {top.map((s) => (
                <div key={s.id} className={`border-l-2 pl-3 py-1 ${SEV_COLORS[s.severity].split(' ')[0]}`}>
                  <div className="flex items-baseline justify-between mb-0.5">
                    <p className="text-sm font-medium">{s.title.split(',')[0]}</p>
                    <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${SEV_COLORS[s.severity].split(' ').slice(1).join(' ')}`}>
                      {s.severity === 'positive' ? 'Pos' : s.severity}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{s.description.split('.')[0]}.</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom row */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Diligence progress</p>
              <a href="checklists" className="text-xs text-primary hover:underline">View checklist</a>
            </div>
            <div className="space-y-3">
              {PROGRESS.map((p) => (
                <div key={p.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>{p.label}</span>
                    <span className="font-mono tabular-nums text-muted-foreground">{p.done} / {p.total}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(p.done / p.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Recent activity</p>
            <div className="space-y-3 text-sm">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={`h-1.5 w-1.5 rounded-full ${a.color} mt-1.5 shrink-0`} />
                  <div className="flex-1 min-w-0">
                    <p>{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
