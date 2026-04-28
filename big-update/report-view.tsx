import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getAppSettings } from '@/lib/settings';
import { PrintButton } from './print-button';
import { EmailReportForm } from './email-report-form';

function fmtMoney(n: number): string {
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
  const signals = snap.signals || [];

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
        {/* Cover with logo */}
        <div className="pb-8 border-b mb-8">
          {settings.logo_url && (
            <img src={settings.logo_url} alt={settings.platform_name} className="h-10 mb-6 object-contain" />
          )}
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">{report.kind.replace(/_/g, ' ')}</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-1">{report.title}</h1>
          <p className="text-lg text-muted-foreground">{company?.name}</p>
          <p className="text-xs text-muted-foreground mt-4 font-mono">Generated {new Date(snap.generated_at).toLocaleDateString()} · {summaries.length} period{summaries.length === 1 ? '' : 's'} of data</p>
        </div>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Executive summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">TTM Revenue</p>
              <p className="text-2xl font-semibold tabular-nums">{fmtMoney(headline.ttm_revenue)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">TTM EBITDA</p>
              <p className="text-2xl font-semibold tabular-nums">{fmtMoney(headline.ttm_ebitda)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Gross Margin</p>
              <p className="text-2xl font-semibold tabular-nums">{fmtPct(headline.ttm_gross_margin_pct)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">EBITDA Margin</p>
              <p className="text-2xl font-semibold tabular-nums">{fmtPct(headline.ttm_ebitda_margin_pct)}</p>
            </div>
          </div>
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Period-by-period detail</h2>
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
        </section>

        <section className="mb-10">
          <h2 className="text-lg font-semibold tracking-tight mb-4">Key signals</h2>
          {signals.length === 0 ? (
            <p className="text-sm text-muted-foreground">No signals detected from current data.</p>
          ) : (
            <div className="space-y-3">
              {signals.filter((s: any) => s.category !== 'Awaiting data').map((s: any) => (
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
          )}
        </section>

        <div className="pt-6 border-t text-xs text-muted-foreground">
          <p>{settings.footer_text}</p>
          <p className="mt-1">Generated {new Date(snap.generated_at).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
