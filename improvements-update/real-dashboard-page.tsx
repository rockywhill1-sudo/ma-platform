import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { RealRevChart } from './real-charts';
import { DashboardActions } from './dashboard-actions';
import { getPeriodSummaries, getPLLineItems, hasFinancialData, getCompanyById, getUploads } from '@/lib/queries';
import { detectSignals } from '@/lib/signals-engine';
import { createClient } from '@/lib/supabase/server';
import { DashboardPage as DemoDashboard } from './dashboard-page';
import { DEMO_SIGNALS } from '@/lib/demo/data';

function fmtMoneyShort(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return '$' + Math.round(n / 1_000).toLocaleString() + 'K';
  return '$' + Math.round(n).toLocaleString();
}

function fmtPct(n: number | null): string {
  if (n == null || isNaN(n)) return '-';
  return n.toFixed(1) + '%';
}

const SEV_COLOR: Record<string, string> = {
  high: 'text-destructive',
  med: 'text-warning',
  low: 'text-info',
  positive: 'text-success',
};

export async function RealDashboardPage({ companyId }: { companyId: string }) {
  const hasData = await hasFinancialData(companyId);
  const company = await getCompanyById(companyId);
  if (!hasData) {
    return <DemoDashboard companyName={company?.name ?? 'Workspace'} signals={DEMO_SIGNALS} />;
  }

  const summaries = await getPeriodSummaries(companyId);
  const lineItems = await getPLLineItems(companyId);
  const uploads = await getUploads(companyId);
  const signals = detectSignals(summaries, lineItems);

  const recentSummaries = summaries.slice(-4);
  const ttmRevenue = recentSummaries.reduce((sum, s) => sum + Number(s.revenue), 0);
  const ttmEbitda = recentSummaries.reduce((sum, s) => sum + Number(s.ebitda), 0);
  const ttmGrossProfit = recentSummaries.reduce((sum, s) => sum + Number(s.gross_profit), 0);
  const ttmGrossMarginPct = ttmRevenue > 0 ? (ttmGrossProfit / ttmRevenue) * 100 : null;
  const ttmEbitdaMarginPct = ttmRevenue > 0 ? (ttmEbitda / ttmRevenue) * 100 : null;

  let yoyDelta: number | null = null;
  if (summaries.length >= 8) {
    const lastFour = summaries.slice(-4);
    const priorFour = summaries.slice(-8, -4);
    const lastRev = lastFour.reduce((s, p) => s + Number(p.revenue), 0);
    const priorRev = priorFour.reduce((s, p) => s + Number(p.revenue), 0);
    if (priorRev > 0) yoyDelta = ((lastRev - priorRev) / priorRev) * 100;
  }

  let qoqMarginDelta: number | null = null;
  if (summaries.length >= 2) {
    const last = summaries[summaries.length - 1];
    const prev = summaries[summaries.length - 2];
    if (last.gross_margin_pct != null && prev.gross_margin_pct != null) {
      qoqMarginDelta = (Number(last.gross_margin_pct) - Number(prev.gross_margin_pct)) * 100;
    }
  }

  const chartData = summaries.map((s) => ({ label: s.period_label, value: Number(s.revenue) }));

  // Real diligence progress from checklists
  const supabase = await createClient();
  const { data: checklists } = await supabase
    .from('checklists')
    .select('id, title')
    .eq('company_id', companyId);

  const progress: { label: string; done: number; total: number }[] = [];
  if (checklists) {
    for (const c of checklists) {
      const { count: total } = await supabase
        .from('checklist_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_id', c.id);
      const { count: done } = await supabase
        .from('checklist_tasks')
        .select('*', { count: 'exact', head: true })
        .eq('checklist_id', c.id)
        .eq('status', 'done');
      progress.push({ label: c.title, done: done ?? 0, total: total ?? 0 });
    }
  }

  const recentActivity = uploads.slice(0, 4).map((u) => ({
    color: u.status === 'parsed' ? 'bg-success' : 'bg-info',
    title: u.file_name,
    sub: u.status === 'parsed'
      ? `Parsed ${u.rows_parsed ?? 0} line items, ${u.periods_detected ?? 0} periods`
      : `${u.status}, uploaded ${new Date(u.created_at).toLocaleDateString()}`,
  }));

  return (
    <>
      <PageHeader
        eyebrow={company?.name ?? 'Workspace'}
        title="Dashboard"
        description={`Computed from ${summaries.length} period${summaries.length === 1 ? '' : 's'} of parsed data`}
        actions={
          <DashboardActions
            companyName={company?.name ?? 'Workspace'}
            ttmRevenue={fmtMoneyShort(ttmRevenue)}
            ttmEbitda={fmtMoneyShort(ttmEbitda)}
            ebitdaMargin={fmtPct(ttmEbitdaMarginPct)}
            grossMargin={fmtPct(ttmGrossMarginPct)}
            periodsCount={summaries.length}
          />
        }
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
              {summaries.length >= 4 ? 'TTM Revenue' : 'Revenue (parsed)'}
            </p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{fmtMoneyShort(ttmRevenue)}</p>
            {yoyDelta != null ? (
              <p className={`text-xs mt-1 tabular-nums flex items-center gap-1 ${yoyDelta >= 0 ? 'text-success' : 'text-destructive'}`}>
                {yoyDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {(yoyDelta >= 0 ? '+' : '') + yoyDelta.toFixed(1)}% YoY
              </p>
            ) : (
              <p className="text-xs mt-1 text-muted-foreground tabular-nums">{summaries.length} periods loaded</p>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">
              {summaries.length >= 4 ? 'TTM EBITDA' : 'EBITDA (parsed)'}
            </p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{fmtMoneyShort(ttmEbitda)}</p>
            <p className="text-xs mt-1 tabular-nums text-success">{fmtPct(ttmEbitdaMarginPct)} margin</p>
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Gross Margin</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{fmtPct(ttmGrossMarginPct)}</p>
            {qoqMarginDelta != null ? (
              <p className={`text-xs mt-1 tabular-nums flex items-center gap-1 ${qoqMarginDelta >= 0 ? 'text-success' : 'text-destructive'}`}>
                {qoqMarginDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {(qoqMarginDelta >= 0 ? '+' : '') + qoqMarginDelta.toFixed(0)} bps QoQ
              </p>
            ) : (
              <p className="text-xs mt-1 text-muted-foreground">vs prior period</p>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Periods Loaded</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">{summaries.length}</p>
            <p className="text-xs mt-1 tabular-nums text-muted-foreground">
              From {uploads.filter((u) => u.status === 'parsed').length} parsed file(s)
            </p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 p-5">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">Revenue by period</p>
                <h3 className="text-base font-semibold tracking-tight">From your parsed data</h3>
              </div>
            </div>
            <div style={{ height: 280 }}><RealRevChart data={chartData} /></div>
          </Card>

          <Card className="p-5">
            <div className="flex items-baseline justify-between mb-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Top signals</p>
              <span className="text-xs text-muted-foreground">{signals.length} detected</span>
            </div>
            {signals.length === 0 ? (
              <div className="text-center py-12 text-sm text-muted-foreground">
                <p>No signals from current data.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {signals.slice(0, 4).map((s) => (
                  <div key={s.id}>
                    <p className={`text-[10px] font-mono uppercase tracking-widest ${SEV_COLOR[s.severity]} mb-0.5`}>{s.severity === 'positive' ? 'Positive' : s.severity}</p>
                    <p className="text-sm font-medium leading-snug">{s.title}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Diligence progress</p>
            {progress.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checklists activated yet. Visit Checklists to start tracking diligence work.</p>
            ) : (
              <div className="space-y-3">
                {progress.map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>{p.label}</span>
                      <span className="font-mono tabular-nums text-muted-foreground">{p.done} / {p.total}</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${p.total > 0 ? (p.done / p.total) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Recent activity</p>
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent uploads.</p>
            ) : (
              <div className="space-y-3 text-sm">
                {recentActivity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className={`h-1.5 w-1.5 rounded-full ${a.color} mt-1.5 shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}
