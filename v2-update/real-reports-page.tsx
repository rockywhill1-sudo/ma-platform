import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { hasFinancialData } from '@/lib/queries';
import { generateReport, deleteReport } from '@/app/companies/[companyId]/reports/actions';
import Link from 'next/link';

const REPORT_TYPES = [
  {
    section: 'Standard',
    items: [
      { kind: 'qoe_summary', title: 'Quality of Earnings', desc: 'Headline metrics, period detail, signals' },
      { kind: 'diligence_summary', title: 'Diligence Summary', desc: 'Concise deal overview' },
      { kind: 'investor_brief', title: 'Investor Brief', desc: 'IOI-ready one-pager' },
      { kind: 'valuation_memo', title: 'Valuation Memo', desc: 'EBITDA-multiple analysis' },
    ],
  },
  {
    section: 'Diligence deep-dives',
    items: [
      { kind: 'customer_concentration', title: 'Customer Concentration', desc: 'Top customer % of revenue, concentration risk' },
      { kind: 'working_capital_norm', title: 'Working Capital Normalization', desc: 'Standard WC level for purchase price target' },
      { kind: 'ebitda_bridge', title: 'EBITDA Bridge & Addbacks', desc: 'Walk from reported to adjusted EBITDA' },
      { kind: 'pro_forma_memo', title: 'Pro Forma Adjustments', desc: 'Pre-close pro forma normalization' },
    ],
  },
  {
    section: 'Closing & post-close',
    items: [
      { kind: 'ic_memo', title: 'Investment Committee Memo', desc: 'Formal IC one-pager with thesis and risks' },
      { kind: 'lender_package', title: 'Lender Package', desc: 'Debt service coverage, covenant compliance' },
      { kind: 'earnout_tracker', title: 'Earnout Tracker', desc: 'Post-close earnout measurement' },
    ],
  },
];

export async function RealReportsPage({ companyId }: { companyId: string }) {
  const supabase = await createClient();
  const hasData = await hasFinancialData(companyId);

  const { data: reports } = await supabase
    .from('reports')
    .select('id, title, kind, page_count, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  return (
    <>
      <PageHeader
        title="Reports"
        description="Investor-grade summaries generated from your parsed financial data"
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        <Card className="p-5">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Generate new report</p>
          {!hasData ? (
            <p className="text-sm text-muted-foreground">Upload financial data first. Reports pull numbers from your parsed P&amp;L.</p>
          ) : (
            <div className="space-y-6">
              {REPORT_TYPES.map((section) => (
                <div key={section.section}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 mb-3">{section.section}</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {section.items.map((r) => (
                      <form key={r.kind} action={generateReport}>
                        <input type="hidden" name="company_id" value={companyId} />
                        <input type="hidden" name="kind" value={r.kind} />
                        <button type="submit" className="block w-full h-full text-left p-4 rounded-md border hover:border-primary hover:bg-muted/30 transition-colors">
                          <FileText className="h-5 w-5 text-primary mb-2" strokeWidth={1.75} />
                          <p className="font-medium text-sm">{r.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{r.desc}</p>
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <div>
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-3">Generated reports</p>
          {!reports || reports.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-sm text-muted-foreground">No reports generated yet. Pick a type above to create your first.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {reports.map((r) => (
                <Card key={r.id} className="overflow-hidden hover:shadow-sm transition-shadow">
                  <Link href={`/companies/${companyId}/reports/${r.id}`} className="block">
                    <div className="aspect-[4/3] bg-muted/50 grid place-items-center border-b">
                      <FileText className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{r.kind.replace(/_/g, ' ')}</p>
                      <h3 className="font-semibold mb-1 truncate">{r.title}</h3>
                      <p className="text-xs text-muted-foreground">
                        {r.page_count} page{r.page_count === 1 ? '' : 's'} · {new Date(r.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </Link>
                  <div className="px-4 pb-4">
                    <form action={deleteReport}>
                      <input type="hidden" name="report_id" value={r.id} />
                      <input type="hidden" name="company_id" value={companyId} />
                      <button type="submit" className="text-xs text-muted-foreground hover:text-destructive">Delete</button>
                    </form>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
