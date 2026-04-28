import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getPeriodSummaries, getPLLineItems } from '@/lib/queries';
import { detectSignals } from '@/lib/signals-engine';
import { computeTimeline } from '@/lib/timeline-engine';
import { saveTimeline } from './actions';

export default async function TimelinePage({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const supabase = await createClient();

  const [{ data: timeline }, summaries, lineItems] = await Promise.all([
    supabase.from('deal_timelines').select('*').eq('company_id', companyId).maybeSingle(),
    getPeriodSummaries(companyId),
    getPLLineItems(companyId),
  ]);

  const signals = detectSignals(summaries, lineItems);
  const startDate = timeline?.start_date || new Date().toISOString().split('T')[0];
  const computed = computeTimeline(startDate, signals, timeline?.current_stage);

  const STAGE_OPTIONS = [
    'Sourcing', 'Initial review', 'IOI submitted', 'Management meetings',
    'LOI signed', 'Diligence', 'Definitive docs', 'Sign + announce', 'Pre-close', 'Close',
  ];

  const highCount = signals.filter((s) => s.severity === 'high' && s.category !== 'Awaiting data').length;
  const medCount = signals.filter((s) => s.severity === 'med' && s.category !== 'Awaiting data').length;
  const adjDays = highCount * 7 + medCount * 3;

  return (
    <>
      <PageHeader
        title="Deal Timeline"
        description={timeline ? `Estimated close: ${new Date(computed.estimatedCloseDate).toLocaleDateString()} (${computed.totalDays} days from start)` : 'Set a start date to estimate close timing'}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        {/* Setup form */}
        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Configure timeline</p>
          <form action={saveTimeline} className="grid md:grid-cols-3 gap-4 items-end">
            <input type="hidden" name="company_id" value={companyId} />
            <div>
              <label className="text-sm font-medium block mb-1">Deal start date</label>
              <input
                type="date"
                name="start_date"
                defaultValue={timeline?.start_date ?? new Date().toISOString().split('T')[0]}
                required
                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Current stage</label>
              <select name="current_stage" defaultValue={timeline?.current_stage ?? 'Sourcing'} className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                {STAGE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
              Save & recompute
            </button>
          </form>

          {(highCount > 0 || medCount > 0) && (
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              <p>
                Diligence extended by <span className="font-mono font-semibold">{adjDays} days</span> based on detected risk signals
                {' ('}
                {highCount > 0 && <>{highCount} high-risk × 7 days</>}
                {highCount > 0 && medCount > 0 && ', '}
                {medCount > 0 && <>{medCount} medium × 3 days</>}
                {')'}
              </p>
            </div>
          )}
        </Card>

        {/* Timeline visualization */}
        <Card className="p-6 overflow-hidden">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-5">Estimated stage dates</p>

          <div className="relative space-y-1">
            <div className="absolute left-4 top-3 bottom-3 w-0.5 bg-border" aria-hidden="true" />
            {computed.stages.map((s, idx) => {
              const Icon = s.status === 'complete' ? CheckCircle2 : s.status === 'current' ? Clock : Circle;
              const iconColor =
                s.status === 'complete' ? 'text-success' :
                s.status === 'current' ? 'text-primary' :
                'text-muted-foreground/40';
              const bgColor =
                s.status === 'complete' ? 'bg-success/10' :
                s.status === 'current' ? 'bg-primary text-primary-foreground' :
                'bg-background border';
              return (
                <div key={s.stage} className="relative flex gap-4 py-3 group hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
                  <div className={`relative z-10 h-8 w-8 rounded-full grid place-items-center text-xs font-semibold tabular-nums shrink-0 shadow-sm ${bgColor}`}>
                    {s.status === 'complete' ? <CheckCircle2 className="h-4 w-4 text-success" /> : <span>{idx + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 flex-wrap">
                      <p className={`font-semibold text-sm ${s.status === 'current' ? 'text-primary' : ''}`}>{s.stage}</p>
                      <p className="text-xs font-mono tabular-nums text-muted-foreground">
                        {new Date(s.date).toLocaleDateString()} → {new Date(s.end_date).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug mt-0.5">{s.description}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      <span>Day {s.days_from_start + 1} - {s.days_from_start + s.duration_days}</span>
                      <span>·</span>
                      <span>{s.duration_days} days</span>
                      {s.status === 'current' && <span className="text-primary">· in progress</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {/* Close date */}
            <div className="relative flex gap-4 py-3 -mx-2 px-2">
              <div className="relative z-10 h-8 w-8 rounded-full bg-success text-success-foreground grid place-items-center shrink-0 shadow-sm">
                <Calendar className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm text-success">Estimated close date</p>
                <p className="text-xs font-mono tabular-nums text-muted-foreground mt-0.5">
                  {new Date(computed.estimatedCloseDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <p className="text-xs text-muted-foreground italic">
          Estimates use industry-typical stage durations. Diligence is extended by detected risk signals (7 days per high-risk, 3 per medium). Adjust expectations based on deal-specific factors not captured in financial data.
        </p>
      </div>
    </>
  );
}
