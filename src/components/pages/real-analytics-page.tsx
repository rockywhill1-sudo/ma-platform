import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { RealGrowthChart, RealMarginChart } from './real-analytics-charts';
import { getPeriodSummaries, getPLLineItems, hasFinancialData } from '@/lib/queries';
import { AnalyticsPage as DemoAnalytics } from './analytics-signals-valuation';

const CATEGORY_LABELS: Record<string, string> = {
  cogs: 'Cost of revenue',
  sales_marketing: 'Sales & Marketing',
  research_development: 'Research & Development',
  general_administrative: 'General & Administrative',
  other_opex: 'Other operating expenses',
  depreciation: 'Depreciation',
  amortization: 'Amortization',
  interest: 'Interest',
  tax: 'Tax',
};

export async function RealAnalyticsPage({ companyId }: { companyId: string }) {
  const hasData = await hasFinancialData(companyId);
  if (!hasData) return <DemoAnalytics />;

  const summaries = await getPeriodSummaries(companyId);
  const lineItems = await getPLLineItems(companyId);

  // Period-over-period revenue growth
  const growthData = summaries.slice(1).map((s, i) => {
    const prior = summaries[i];
    const growth = Number(prior.revenue) > 0
      ? ((Number(s.revenue) - Number(prior.revenue)) / Number(prior.revenue)) * 100
      : 0;
    return { label: s.period_label, growth };
  });

  // Margin trend
  const marginData = summaries.map((s) => ({
    label: s.period_label,
    gross: s.gross_margin_pct != null ? Number(s.gross_margin_pct) : null,
    ebitda: s.ebitda_margin_pct != null ? Number(s.ebitda_margin_pct) : null,
  }));

  // Total revenue across all periods (for percentage calculations)
  const totalRevenue = summaries.reduce((sum, s) => sum + Number(s.revenue), 0);

  // Expense breakdown by category, totaled across all periods
  const expenseByCategory = new Map<string, number>();
  for (const item of lineItems) {
    if (item.category === 'revenue' || item.category === 'gross_profit' || item.category === 'ebitda' || item.category === 'net_income' || item.category === 'unmapped') continue;
    const current = expenseByCategory.get(item.category) || 0;
    expenseByCategory.set(item.category, current + Math.abs(Number(item.amount)));
  }
  const expenseRows = Array.from(expenseByCategory.entries())
    .map(([cat, total]) => ({
      category: cat,
      label: CATEGORY_LABELS[cat] || cat,
      total,
      pctOfRevenue: totalRevenue > 0 ? (total / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Recent growth summary
  const recentGrowth = growthData.length > 0 ? growthData[growthData.length - 1].growth : 0;
  const avgGrowth = growthData.length > 0
    ? growthData.reduce((s, g) => s + g.growth, 0) / growthData.length
    : 0;

  return (
    <>
      <PageHeader
        title="Analytics"
        description={`Trends, margins, and expense breakdown from ${summaries.length} parsed periods`}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-4">
        {/* Top KPI strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Latest period growth</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {(recentGrowth >= 0 ? '+' : '') + recentGrowth.toFixed(1)}%
            </p>
            <p className="text-xs mt-1 text-muted-foreground">vs prior period</p>
          </Card>
          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Avg period growth</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              {(avgGrowth >= 0 ? '+' : '') + avgGrowth.toFixed(1)}%
            </p>
            <p className="text-xs mt-1 text-muted-foreground">across {growthData.length} periods</p>
          </Card>
          <Card className="p-4">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Total expenses tracked</p>
            <p className="text-2xl font-semibold tabular-nums tracking-tight">
              ${(Array.from(expenseByCategory.values()).reduce((s, v) => s + v, 0) / 1_000_000).toFixed(2)}M
            </p>
            <p className="text-xs mt-1 text-muted-foreground">{expenseRows.length} categories</p>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-4">
          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Revenue growth</p>
            <h3 className="text-base font-semibold mb-4">Period over period</h3>
            <div style={{ height: 240 }}>
              {growthData.length > 0 ? <RealGrowthChart data={growthData} /> : <div className="h-full grid place-items-center text-sm text-muted-foreground">Need at least 2 periods to compute growth</div>}
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Margins</p>
            <h3 className="text-base font-semibold mb-4">Gross and EBITDA over time</h3>
            <div style={{ height: 240 }}><RealMarginChart data={marginData} /></div>
          </Card>
        </div>

        {/* Expense breakdown */}
        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Expense breakdown</p>
          <h3 className="text-base font-semibold mb-4">By category, all periods combined</h3>
          {expenseRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No expense data parsed yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground border-b">
                <tr>
                  <th className="text-left py-2">Category</th>
                  <th className="text-right py-2">Total</th>
                  <th className="text-right py-2">% of revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {expenseRows.map((r) => (
                  <tr key={r.category} className="row-hover">
                    <td className="py-2 font-medium">{r.label}</td>
                    <td className="py-2 text-right font-mono tabular-nums">{r.total.toLocaleString()}</td>
                    <td className="py-2 text-right font-mono tabular-nums text-muted-foreground">{r.pctOfRevenue.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </>
  );
}