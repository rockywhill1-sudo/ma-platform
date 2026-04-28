import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { getPeriodSummaries, getPLLineItems, hasFinancialData } from '@/lib/queries';
import { detectSignals } from '@/lib/signals-engine';
import { SignalsPage as DemoSignals } from './analytics-signals-valuation';
import { DEMO_SIGNALS } from '@/lib/demo/data';
import { SignalsFilter } from './signals-filter';

export async function RealSignalsPage({ companyId, severityFilter }: { companyId: string; severityFilter?: string }) {
  const hasData = await hasFinancialData(companyId);
  if (!hasData) return <DemoSignals signals={DEMO_SIGNALS} />;

  const summaries = await getPeriodSummaries(companyId);
  const lineItems = await getPLLineItems(companyId);
  const allSignals = detectSignals(summaries, lineItems);

  const counts = {
    high: allSignals.filter((s) => s.severity === 'high' && s.category !== 'Awaiting data').length,
    med: allSignals.filter((s) => s.severity === 'med' && s.category !== 'Awaiting data').length,
    low: allSignals.filter((s) => s.severity === 'low' && s.category !== 'Awaiting data').length,
    positive: allSignals.filter((s) => s.severity === 'positive').length,
    awaiting: allSignals.filter((s) => s.category === 'Awaiting data').length,
  };

  let signals = allSignals;
  if (severityFilter && severityFilter !== 'all') {
    if (severityFilter === 'awaiting') {
      signals = allSignals.filter((s) => s.category === 'Awaiting data');
    } else {
      signals = allSignals.filter((s) => s.severity === severityFilter && s.category !== 'Awaiting data');
    }
  }

  return (
    <>
      <PageHeader
        title="Signals"
        description={`${counts.high} high, ${counts.med} medium, ${counts.low} low, ${counts.positive} positive · ${counts.awaiting} awaiting data`}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-4">
        <SignalsFilter counts={counts} active={severityFilter ?? 'all'} />

        {signals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-base font-medium mb-2">No signals match this filter</p>
            <p className="text-sm text-muted-foreground">Try a different severity filter, or upload more data.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {signals.map((s) => (
              <SignalCard key={s.id} signal={s} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

const SEV_BORDER: Record<string, string> = {
  high: 'border-destructive',
  med: 'border-warning',
  low: 'border-info',
  positive: 'border-success',
};

const SEV_BADGE: Record<string, string> = {
  high: 'text-destructive bg-destructive/10 border-destructive/20',
  med: 'text-warning bg-warning/10 border-warning/20',
  low: 'text-info bg-info/10 border-info/20',
  positive: 'text-success bg-success/10 border-success/20',
};

function SignalCard({ signal }: { signal: any }) {
  const isAwaiting = signal.category === 'Awaiting data';
  return (
    <Card className={`border-l-4 ${isAwaiting ? 'border-muted-foreground/30 opacity-75' : SEV_BORDER[signal.severity]} p-5 hover:bg-muted/30`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {!isAwaiting && (
              <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${SEV_BADGE[signal.severity]}`}>
                {signal.severity === 'positive' ? 'Positive' : signal.severity}
              </span>
            )}
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{signal.category}</span>
          </div>
          <h3 className="font-semibold mb-1">{signal.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{signal.description}</p>
          {signal.evidence.length > 0 && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Evidence ({signal.evidence.length})</summary>
              <ul className="mt-2 space-y-0.5 font-mono text-muted-foreground pl-4">
                {signal.evidence.map((e: string, i: number) => <li key={i}>{e}</li>)}
              </ul>
            </details>
          )}
          {!isAwaiting && (
            <div className="flex items-center gap-4 text-xs text-muted-foreground font-mono tabular-nums mt-3">
              <span>Detected · {signal.detected}</span>
              {signal.confidence != null && <span>Confidence · {Math.round(signal.confidence * 100)}%</span>}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
