import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { FileText, Sparkles, FolderOpen } from 'lucide-react';
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
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-8">

        {/* Generate new section */}
        <section>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b">
            <div className="h-10 w-10 rounded-lg gradient-primary text-white grid place-items-center shrink-0 shadow-md">
              <Sparkles className="h-5 w-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-xl font-semibold tracking-tight">Generate a new report</h2>
              <p className="text-sm text-muted-foreground">Pick a template below to instantly generate a snapshot from your current data.</p>
            </div>
          </div>

          {!hasData ? (
            <Card className="p-6">
              <p className="text-sm text-muted-foreground">Upload financial data first. Reports pull numbers from your parsed P&amp;L.</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {REPORT_TYPES.map((section) => (
                <div key={section.section}>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-primary mb-3">{section.section}</p>
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    {section.items.map((r) => (
                      <form key={r.kind} action={generateReport}>
                        <input type="hidden" name="company_id" value={companyId} />
                        <input type="hidden" name="kind" value={r.kind} />
                        <button type="submit" className="block w-full h-full text-left p-4 rounded-lg border bg-card hover:border-primary hover:shadow-md transition-all group">
                          <div className="flex items-start gap-2.5 mb-1">
                            <div className="h-6 w-6 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <FileText className="h-3.5 w-3.5" strokeWidth={2} />
                            </div>
                            <p className="font-medium text-sm flex-1">{r.title}</p>
                          </div>
                          <p className="text-xs text-muted-foreground pl-8">{r.desc}</p>
                        </button>
                      </form>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Generated reports section - distinct header */}
        <section>
          <div className="flex items-center gap-3 mb-5 pb-3 border-b">
            <div className="h-10 w-10 rounded-lg bg-muted text-foreground grid place-items-center shrink-0">
              <FolderOpen className="h-5 w-5" strokeWidth={2} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold tracking-tight">Generated reports</h2>
              <p className="text-sm text-muted-foreground">Your previously created reports. Click any to view, share, or print.</p>
            </div>
            {reports && reports.length > 0 && (
              <span className="text-xs font-mono tabular-nums text-muted-foreground bg-muted px-2 py-1 rounded">
                {reports.length} total
              </span>
            )}
          </div>

          {!reports || reports.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-sm text-muted-foreground">No reports generated yet. Pick a type above to create your first.</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {reports.map((r) => (
                <Card key={r.id} className="overflow-hidden hover:shadow-md hover:border-primary/30 transition-all">
                  <Link href={`/companies/${companyId}/reports/${r.id}`} className="block p-4">
                    <div className="flex items-start gap-3 mb-2">
                      <div className="h-8 w-8 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                        <FileText className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">{r.kind.replace(/_/g, ' ')}</p>
                        <h3 className="font-semibold text-sm leading-tight truncate">{r.title}</h3>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground tabular-nums pl-11">
                      {r.page_count} page{r.page_count === 1 ? '' : 's'} · {new Date(r.created_at).toLocaleDateString()}
                    </p>
                  </Link>
                  <div className="px-4 pb-3 pl-15">
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
        </section>
      </div>
    </>
  );
}
