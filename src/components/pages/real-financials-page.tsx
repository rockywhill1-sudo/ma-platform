import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { FinancialsPage as DemoFinancials } from '@/components/pages/financials-page';
import { getPeriodSummaries, getPLLineItems, hasFinancialData } from '@/lib/queries';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

export async function RealFinancialsPage({ companyId }: { companyId: string }) {
  const hasData = await hasFinancialData(companyId);
  if (!hasData) return <DemoFinancials />;

  const summaries = await getPeriodSummaries(companyId);
  const lineItems = await getPLLineItems(companyId);

  const categoryOrder = [
    { key: 'revenue', label: 'Revenue', emphasis: 'top', icon: TrendingUp },
    { key: 'cogs', label: 'Cost of revenue', emphasis: null, icon: null },
    { key: 'gross_profit', label: 'Gross profit', emphasis: 'mid', icon: DollarSign },
    { key: 'sales_marketing', label: 'Sales & Marketing', emphasis: null, icon: null },
    { key: 'research_development', label: 'Research & Development', emphasis: null, icon: null },
    { key: 'general_administrative', label: 'General & Administrative', emphasis: null, icon: null },
    { key: 'other_opex', label: 'Other operating expenses', emphasis: null, icon: null },
    { key: 'ebitda', label: 'EBITDA', emphasis: 'bottom', icon: Wallet },
  ] as const;

  const matrix = new Map<string, Map<string, number>>();
  for (const li of lineItems) {
    if (!matrix.has(li.category)) matrix.set(li.category, new Map());
    const periodMap = matrix.get(li.category)!;
    periodMap.set(li.period_label, (periodMap.get(li.period_label) || 0) + Number(li.amount));
  }

  const periodLabels = Array.from(new Set(lineItems.map((l) => l.period_label)));

  for (const s of summaries) {
    if (!matrix.has('gross_profit')) matrix.set('gross_profit', new Map());
    matrix.get('gross_profit')!.set(s.period_label, Number(s.gross_profit));
    if (!matrix.has('ebitda')) matrix.set('ebitda', new Map());
    matrix.get('ebitda')!.set(s.period_label, Number(s.ebitda));
  }

  const fmt = (n: number | undefined): string => {
    if (n == null || isNaN(n)) return '-';
    if (n < 0) return `(${Math.abs(n).toLocaleString()})`;
    return n.toLocaleString();
  };

  return (
    <>
      <PageHeader
        title="Financials"
        description={`P&L, parsed from ${summaries.length} period${summaries.length === 1 ? '' : 's'}`}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        <Card className="overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border-b px-4 py-3">
            <p className="text-[11px] font-mono uppercase tracking-widest text-primary">Profit & loss summary</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left bg-muted/40 border-b">
                  <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground">Line item</th>
                  {periodLabels.map((p) => (
                    <th key={p} className="px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground text-right tabular-nums">{p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categoryOrder.map(({ key, label, emphasis, icon: Icon }, idx) => {
                  const periodMap = matrix.get(key);
                  if (!periodMap || periodMap.size === 0) return null;
                  const isEmphasized = emphasis !== null;
                  const isAlt = idx % 2 === 1 && !isEmphasized;
                  const bgClass = emphasis === 'top' ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent' :
                                  emphasis === 'mid' ? 'bg-gradient-to-r from-accent/10 via-accent/5 to-transparent border-y-2 border-accent/20' :
                                  emphasis === 'bottom' ? 'bg-gradient-to-r from-success/10 via-success/5 to-transparent border-t-2 border-success/30' :
                                  isAlt ? 'bg-muted/20' : '';
                  return (
                    <tr key={key} className={`${bgClass} border-b last:border-0 hover:bg-muted/40 transition-colors`}>
                      <td className={`px-4 py-3 ${isEmphasized ? 'font-semibold' : ''}`}>
                        <div className="flex items-center gap-2">
                          {Icon ? <Icon className={`h-3.5 w-3.5 ${emphasis === 'top' ? 'text-primary' : emphasis === 'mid' ? 'text-accent' : 'text-success'}`} /> : <span className="w-3.5" />}
                          <span>{label}</span>
                        </div>
                      </td>
                      {periodLabels.map((p) => {
                        const v = periodMap.get(p);
                        return (
                          <td key={p} className={`px-4 py-3 text-right font-mono tabular-nums ${isEmphasized ? 'font-semibold' : ''} ${(v ?? 0) < 0 ? 'text-muted-foreground' : ''}`}>
                            {fmt(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                <tr className="border-t bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 pl-8 text-muted-foreground text-xs italic">Gross margin %</td>
                  {periodLabels.map((p) => {
                    const s = summaries.find((s) => s.period_label === p);
                    return (
                      <td key={p} className="px-4 py-2.5 text-right font-mono tabular-nums text-xs text-muted-foreground">
                        {s?.gross_margin_pct != null ? `${Number(s.gross_margin_pct).toFixed(1)}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-t bg-muted/20 hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-2.5 pl-8 text-muted-foreground text-xs italic">EBITDA margin %</td>
                  {periodLabels.map((p) => {
                    const s = summaries.find((s) => s.period_label === p);
                    return (
                      <td key={p} className="px-4 py-2.5 text-right font-mono tabular-nums text-xs text-muted-foreground">
                        {s?.ebitda_margin_pct != null ? `${Number(s.ebitda_margin_pct).toFixed(1)}%` : '-'}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Unmapped line items</p>
          <p className="text-xs text-muted-foreground mb-3">These rows could not be auto-categorized. They are stored and ignored from totals.</p>
          {(() => {
            const unmapped = lineItems.filter((l) => l.category === 'unmapped');
            if (unmapped.length === 0) return <p className="text-sm text-muted-foreground">All line items were categorized successfully.</p>;
            const grouped = new Map<string, number>();
            for (const u of unmapped) grouped.set(u.raw_label, (grouped.get(u.raw_label) || 0) + Number(u.amount));
            return (
              <ul className="text-sm space-y-1">
                {Array.from(grouped.entries()).slice(0, 20).map(([label, total]) => (
                  <li key={label} className="flex justify-between font-mono">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="tabular-nums">{total.toLocaleString()}</span>
                  </li>
                ))}
                {grouped.size > 20 && <li className="text-xs text-muted-foreground">,and {grouped.size - 20} more</li>}
              </ul>
            );
          })()}
        </Card>
      </div>
    </>
  );
}
