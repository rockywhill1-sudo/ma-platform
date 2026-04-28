import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '@/lib/settings';
import { PrintButton } from './print-button';
import { EmailReportForm } from './email-report-form';

function fmtMoney(n: number): string {
  if (n == null || isNaN(n)) return '-';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return '$' + (n / 1_000_000).toFixed(2) + 'M';
  if (abs >= 1_000) return '$' + Math.round(n / 1_000).toLocaleString() + 'K';
  return '$' + Math.round(n).toLocaleString();
}

function fmtPct(n: number | null | undefined): string {
  if (n == null || isNaN(Number(n))) return '-';
  return Number(n).toFixed(1) + '%';
}

const SEV_LABEL: Record<string, string> = { high: 'High Risk', med: 'Medium', low: 'Low', positive: 'Positive' };
const SEV_COLOR: Record<string, string> = { high: '#dc2626', med: '#ea580c', low: '#2563eb', positive: '#16a34a' };

export async function ReportView({ reportId, companyId }: { reportId: string; companyId: string }) {
  const supabase = await createClient();
  const [{ data: report }, settings] = await Promise.all([
    supabase.from('reports').select('*').eq('id', reportId).single(),
    getAppSettings(),
  ]);

  if (!report) notFound();

  const snap = report.snapshot as any;
  const company = snap.company;
  const headline = snap.headline;
  const summaries = snap.summaries || [];
  const signals = (snap.signals || []).filter((s: any) => s.category !== 'Awaiting data');
  const kind = report.kind;

  return (
    <div className="bg-white">
      <div className="print:hidden border-b bg-muted/30 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href={`/companies/${companyId}/reports`} className="text-sm text-primary hover:underline">← Back to Reports</Link>
        <div className="flex items-center gap-2">
          <EmailReportForm reportId={reportId} reportTitle={report.title} />
          <PrintButton />
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-12 print:p-0">
        {/* Cover */}
        <div className="pb-8 border-b mb-8">
          {settings.logo_url && (
            <img src={settings.logo_url} alt={settings.platform_name} className="h-10 mb-6 object-contain" />
          )}
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{kind.replace(/_/g, ' ')}</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">{report.title}</h1>
          <p className="text-lg text-muted-foreground">{company?.name}</p>
          <p className="text-xs text-muted-foreground mt-4 font-mono">Generated {new Date(snap.generated_at).toLocaleDateString()} · {summaries.length} period{summaries.length === 1 ? '' : 's'} of data</p>
        </div>

        {/* Render kind-specific content */}
        <ReportContent kind={kind} headline={headline} summaries={summaries} signals={signals} company={company} />

        {/* Footer */}
        <div className="pt-6 border-t text-xs text-muted-foreground mt-10">
          <p>{settings.footer_text}</p>
          <p className="mt-1">Generated {new Date(snap.generated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

function ReportContent({ kind, headline, summaries, signals, company }: any) {
  switch (kind) {
    case 'investor_brief':
      return <InvestorBrief headline={headline} signals={signals} />;
    case 'customer_concentration':
      return <CustomerConcentration company={company} />;
    case 'working_capital_norm':
      return <WorkingCapitalNorm company={company} />;
    case 'ebitda_bridge':
      return <EbitdaBridge headline={headline} summaries={summaries} />;
    case 'pro_forma_memo':
      return <ProFormaMemo headline={headline} summaries={summaries} />;
    case 'ic_memo':
      return <ICMemo headline={headline} summaries={summaries} signals={signals} company={company} />;
    case 'lender_package':
      return <LenderPackage headline={headline} summaries={summaries} />;
    case 'earnout_tracker':
      return <EarnoutTracker headline={headline} summaries={summaries} />;
    case 'valuation_memo':
      return <ValuationMemo headline={headline} />;
    case 'diligence_summary':
    case 'qoe_summary':
    default:
      return <StandardReport headline={headline} summaries={summaries} signals={signals} />;
  }
}

function HeadlineGrid({ headline }: { headline: any }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div><p className="text-xs text-muted-foreground mb-1">TTM Revenue</p><p className="text-2xl font-semibold tabular-nums">{fmtMoney(headline.ttm_revenue)}</p></div>
      <div><p className="text-xs text-muted-foreground mb-1">TTM EBITDA</p><p className="text-2xl font-semibold tabular-nums">{fmtMoney(headline.ttm_ebitda)}</p></div>
      <div><p className="text-xs text-muted-foreground mb-1">Gross Margin</p><p className="text-2xl font-semibold tabular-nums">{fmtPct(headline.ttm_gross_margin_pct)}</p></div>
      <div><p className="text-xs text-muted-foreground mb-1">EBITDA Margin</p><p className="text-2xl font-semibold tabular-nums">{fmtPct(headline.ttm_ebitda_margin_pct)}</p></div>
    </div>
  );
}

function PeriodTable({ summaries }: { summaries: any[] }) {
  return (
    <table className="w-full text-sm border">
      <thead className="bg-muted/50">
        <tr className="text-left">
          <th className="px-3 py-2 font-medium">Period</th>
          <th className="px-3 py-2 font-medium text-right">Revenue</th>
          <th className="px-3 py-2 font-medium text-right">Gross profit</th>
          <th className="px-3 py-2 font-medium text-right">EBITDA</th>
          <th className="px-3 py-2 font-medium text-right">GM %</th>
          <th className="px-3 py-2 font-medium text-right">EBITDA %</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {summaries.map((s: any) => (
          <tr key={s.period_label}>
            <td className="px-3 py-2 font-medium">{s.period_label}</td>
            <td className="px-3 py-2 text-right font-mono tabular-nums">{Number(s.revenue).toLocaleString()}</td>
            <td className="px-3 py-2 text-right font-mono tabular-nums">{Number(s.gross_profit).toLocaleString()}</td>
            <td className="px-3 py-2 text-right font-mono tabular-nums">{Number(s.ebitda).toLocaleString()}</td>
            <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{fmtPct(s.gross_margin_pct)}</td>
            <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">{fmtPct(s.ebitda_margin_pct)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SignalsList({ signals }: { signals: any[] }) {
  if (signals.length === 0) return <p className="text-sm text-muted-foreground">No signals detected.</p>;
  return (
    <div className="space-y-3">
      {signals.map((s: any) => (
        <div key={s.id} style={{ borderLeft: '4px solid ' + SEV_COLOR[s.severity] }} className="pl-4 py-2">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: SEV_COLOR[s.severity] }}>{SEV_LABEL[s.severity]}</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{s.category}</span>
          </div>
          <p className="font-medium text-sm">{s.title}</p>
          <p className="text-sm text-muted-foreground mt-1">{s.description}</p>
        </div>
      ))}
    </div>
  );
}

function StandardReport({ headline, summaries, signals }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Executive summary</h2>
        <HeadlineGrid headline={headline} />
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Period-by-period detail</h2>
        <PeriodTable summaries={summaries} />
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Key signals</h2>
        <SignalsList signals={signals} />
      </section>
    </>
  );
}

function InvestorBrief({ headline, signals }: any) {
  const high = signals.filter((s: any) => s.severity === 'high');
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Investment highlights</h2>
        <HeadlineGrid headline={headline} />
        <ul className="mt-6 space-y-2 text-sm">
          <li>• TTM revenue of {fmtMoney(headline.ttm_revenue)} with {fmtPct(headline.ttm_gross_margin_pct)} gross margin</li>
          <li>• EBITDA of {fmtMoney(headline.ttm_ebitda)} ({fmtPct(headline.ttm_ebitda_margin_pct)} margin)</li>
          <li>• {headline.periods_count} periods of audited data available for diligence</li>
        </ul>
      </section>
      {high.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Risks to validate</h2>
          <SignalsList signals={high} />
        </section>
      )}
    </>
  );
}

function CustomerConcentration({ company }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Customer concentration analysis</h2>
        <p className="text-sm text-muted-foreground mb-4">{company?.name} customer concentration risk assessment.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-5">
          <p className="text-sm font-medium text-amber-900 mb-1">Awaiting customer detail data</p>
          <p className="text-sm text-amber-800">Upload a "Sales by Customer Summary" report from your accounting system to populate concentration analysis.</p>
          <p className="text-xs text-amber-700 mt-3 font-mono">Once data is loaded, this report will include: top customer % of revenue, top 10 % of revenue, customer cohort retention, and revenue at risk.</p>
        </div>
      </section>
    </>
  );
}

function WorkingCapitalNorm({ company }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Working capital normalization</h2>
        <p className="text-sm text-muted-foreground mb-4">Standard working capital target for purchase price true-up.</p>
        <div className="bg-amber-50 border border-amber-200 rounded-md p-5">
          <p className="text-sm font-medium text-amber-900 mb-1">Awaiting balance sheet data</p>
          <p className="text-sm text-amber-800">Upload Balance Sheet by quarter to compute working capital normalization.</p>
          <p className="text-xs text-amber-700 mt-3 font-mono">Once data is loaded, this report will include: WC by period, normalized target, seasonality adjustments, true-up methodology.</p>
        </div>
      </section>
    </>
  );
}

function EbitdaBridge({ headline, summaries }: any) {
  const reportedEbitda = headline.ttm_ebitda;
  const ownerAddback = reportedEbitda * 0.08;
  const oneTimeAddback = reportedEbitda * 0.05;
  const adjustedEbitda = reportedEbitda + ownerAddback + oneTimeAddback;

  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">EBITDA bridge — reported to adjusted</h2>
        <p className="text-sm text-muted-foreground mb-4">Estimated addbacks based on typical patterns. Actuals require GL detail review.</p>
        <table className="w-full text-sm border">
          <tbody className="divide-y">
            <tr className="bg-muted/30">
              <td className="px-3 py-2 font-medium">TTM Reported EBITDA</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtMoney(reportedEbitda)}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">+ Owner / family compensation addback (estimated)</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">+{fmtMoney(ownerAddback)}</td>
            </tr>
            <tr>
              <td className="px-3 py-2">+ One-time / non-recurring expenses (estimated)</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-muted-foreground">+{fmtMoney(oneTimeAddback)}</td>
            </tr>
            <tr className="bg-success/10 font-semibold">
              <td className="px-3 py-2">= TTM Adjusted EBITDA (illustrative)</td>
              <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtMoney(adjustedEbitda)}</td>
            </tr>
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-3">Addbacks shown are illustrative percentages of EBITDA. Validated addbacks require General Ledger detail review.</p>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">EBITDA by period</h2>
        <PeriodTable summaries={summaries} />
      </section>
    </>
  );
}

function ProFormaMemo({ headline, summaries }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Pro forma adjustments memo</h2>
        <p className="text-sm text-muted-foreground mb-4">Anticipated post-close pro forma adjustments.</p>
        <HeadlineGrid headline={headline} />
        <table className="w-full text-sm border mt-6">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Adjustment category</th>
              <th className="px-3 py-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            <tr><td className="px-3 py-2">Owner compensation normalization</td><td className="px-3 py-2 text-right text-muted-foreground">Pending GL review</td></tr>
            <tr><td className="px-3 py-2">One-time professional fees</td><td className="px-3 py-2 text-right text-muted-foreground">Pending GL review</td></tr>
            <tr><td className="px-3 py-2">Discontinued product lines</td><td className="px-3 py-2 text-right text-muted-foreground">N/A unless flagged</td></tr>
            <tr><td className="px-3 py-2">Non-recurring revenue</td><td className="px-3 py-2 text-right text-muted-foreground">Pending revenue detail</td></tr>
            <tr><td className="px-3 py-2">New leadership comp adjustments</td><td className="px-3 py-2 text-right text-muted-foreground">Per LOI structure</td></tr>
          </tbody>
        </table>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Period detail</h2>
        <PeriodTable summaries={summaries} />
      </section>
    </>
  );
}

function ICMemo({ headline, summaries, signals, company }: any) {
  const high = signals.filter((s: any) => s.severity === 'high');
  const positive = signals.filter((s: any) => s.severity === 'positive');
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Investment thesis</h2>
        <p className="text-sm leading-relaxed">{company?.name} represents an opportunity to acquire a {company?.industry ?? 'business'} with TTM revenue of {fmtMoney(headline.ttm_revenue)} and EBITDA of {fmtMoney(headline.ttm_ebitda)} ({fmtPct(headline.ttm_ebitda_margin_pct)} margin).</p>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Financial summary</h2>
        <HeadlineGrid headline={headline} />
      </section>
      {positive.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Strengths</h2>
          <SignalsList signals={positive} />
        </section>
      )}
      {high.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Key risks</h2>
          <SignalsList signals={high} />
        </section>
      )}
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Recommended next steps</h2>
        <ul className="text-sm space-y-2">
          <li>1. Complete Quality of Earnings analysis (4-6 weeks)</li>
          <li>2. Customer reference calls with top 10 customers</li>
          <li>3. Tech and security audit (if applicable)</li>
          <li>4. Legal diligence — corporate structure, contracts, IP</li>
          <li>5. Validate addbacks against General Ledger</li>
        </ul>
      </section>
    </>
  );
}

function LenderPackage({ headline, summaries }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Borrower financial summary</h2>
        <HeadlineGrid headline={headline} />
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Debt service coverage analysis</h2>
        <p className="text-sm text-muted-foreground mb-4">Illustrative DSCR scenarios at typical leverage levels.</p>
        <table className="w-full text-sm border">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Leverage scenario</th>
              <th className="px-3 py-2 font-medium text-right">Debt amount</th>
              <th className="px-3 py-2 font-medium text-right">Annual debt service (est)</th>
              <th className="px-3 py-2 font-medium text-right">DSCR</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {[3, 4, 5, 6].map((mult) => {
              const debt = headline.ttm_ebitda * mult;
              const annualDS = debt * 0.10;
              const dscr = headline.ttm_ebitda / annualDS;
              return (
                <tr key={mult}>
                  <td className="px-3 py-2 font-medium">{mult}.0x EBITDA</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtMoney(debt)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtMoney(annualDS)}</td>
                  <td className="px-3 py-2 text-right font-mono tabular-nums">{dscr.toFixed(2)}x</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-3">Assumes 10% all-in debt service rate. Lender-specific terms will adjust. DSCR &lt; 1.25x typically uncovenant-able.</p>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Period detail</h2>
        <PeriodTable summaries={summaries} />
      </section>
    </>
  );
}

function EarnoutTracker({ headline, summaries }: any) {
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Earnout measurement</h2>
        <p className="text-sm text-muted-foreground mb-4">Post-close earnout performance tracking.</p>
        <HeadlineGrid headline={headline} />
        <div className="bg-info/5 border border-info/20 rounded-md p-5 mt-6">
          <p className="text-sm font-medium mb-1">Set up earnout terms</p>
          <p className="text-sm text-muted-foreground">Earnout structure (revenue threshold, EBITDA threshold, multiplier, cap) is set at close. Add specific terms to track performance against them in this report.</p>
        </div>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Period detail</h2>
        <PeriodTable summaries={summaries} />
      </section>
    </>
  );
}

function ValuationMemo({ headline }: any) {
  const ebitda = headline.ttm_ebitda;
  const multiples = [5, 7, 9, 11];
  return (
    <>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Indicative valuation range</h2>
        <p className="text-sm text-muted-foreground mb-4">Based on TTM EBITDA of {fmtMoney(ebitda)}.</p>
        <table className="w-full text-sm border">
          <thead className="bg-muted/50">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">EV / EBITDA</th>
              <th className="px-3 py-2 font-medium text-right">Enterprise Value</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {multiples.map((m) => (
              <tr key={m} className={m === 9 ? 'bg-success/10 font-semibold' : ''}>
                <td className="px-3 py-2">{m}.0x</td>
                <td className="px-3 py-2 text-right font-mono tabular-nums">{fmtMoney(ebitda * m)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-xs text-muted-foreground mt-3">9.0x highlighted as base case. Range adjusts for sector, growth, and risk profile.</p>
      </section>
      <section className="mb-10">
        <h2 className="text-lg font-semibold tracking-tight mb-4">Valuation drivers</h2>
        <HeadlineGrid headline={headline} />
      </section>
    </>
  );
}
