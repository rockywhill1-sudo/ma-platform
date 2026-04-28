/**
 * Deal timeline estimator.
 * Takes a start date and computes estimated dates for each deal stage.
 *
 * Default duration assumptions are based on typical mid-market private deals.
 * Adjusts based on signals (e.g., high-risk signals = +30 days for diligence).
 */

import type { Signal } from './signals-engine';

export type StageEstimate = {
  stage: string;
  description: string;
  days_from_start: number;
  duration_days: number;
  date: string;
  end_date: string;
  status: 'pending' | 'current' | 'complete';
};

const BASE_STAGES = [
  { stage: 'Sourcing', desc: 'Identify target, NDA, initial review', duration: 21 },
  { stage: 'Initial review', desc: 'CIM review, high-level financial assessment', duration: 14 },
  { stage: 'IOI submitted', desc: 'Indication of interest with valuation range', duration: 7 },
  { stage: 'Management meetings', desc: 'In-person or virtual with leadership', duration: 14 },
  { stage: 'LOI signed', desc: 'Letter of intent, exclusivity period begins', duration: 7 },
  { stage: 'Diligence', desc: 'QoE, legal, commercial, tech, HR review', duration: 45 },
  { stage: 'Definitive docs', desc: 'SPA / APA drafting and negotiation', duration: 21 },
  { stage: 'Sign + announce', desc: 'Execute definitive agreement', duration: 3 },
  { stage: 'Pre-close', desc: 'Regulatory, consents, financing', duration: 30 },
  { stage: 'Close', desc: 'Funds wire, ownership transfers', duration: 1 },
];

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function fmtDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

export function computeTimeline(
  startDate: string,
  signals: Signal[],
  currentStage?: string
): { stages: StageEstimate[]; estimatedCloseDate: string; totalDays: number } {
  const start = new Date(startDate + 'T00:00:00Z');
  const today = new Date();

  // Adjust diligence duration based on signals
  const highRiskCount = signals.filter((s) => s.severity === 'high' && s.category !== 'Awaiting data').length;
  const mediumRiskCount = signals.filter((s) => s.severity === 'med' && s.category !== 'Awaiting data').length;

  // Each high-risk signal adds 7 days, each medium adds 3
  const diligenceAdjustment = highRiskCount * 7 + mediumRiskCount * 3;

  const stages = [...BASE_STAGES];
  // Find diligence stage and adjust
  const diligenceIdx = stages.findIndex((s) => s.stage === 'Diligence');
  if (diligenceIdx >= 0) {
    stages[diligenceIdx] = { ...stages[diligenceIdx], duration: stages[diligenceIdx].duration + diligenceAdjustment };
  }

  let cumulativeDays = 0;
  const result: StageEstimate[] = [];

  for (const s of stages) {
    const stageStart = addDays(start, cumulativeDays);
    const stageEnd = addDays(stageStart, s.duration);

    let status: 'pending' | 'current' | 'complete' = 'pending';
    if (currentStage) {
      // If we know the current stage, mark passed/current/future
      const currentIdx = stages.findIndex((st) => st.stage.toLowerCase() === currentStage.toLowerCase());
      const myIdx = stages.indexOf(s);
      if (myIdx < currentIdx) status = 'complete';
      else if (myIdx === currentIdx) status = 'current';
    } else {
      // Auto-determine from today
      if (today > stageEnd) status = 'complete';
      else if (today >= stageStart && today <= stageEnd) status = 'current';
    }

    result.push({
      stage: s.stage,
      description: s.desc,
      days_from_start: cumulativeDays,
      duration_days: s.duration,
      date: fmtDate(stageStart),
      end_date: fmtDate(stageEnd),
      status,
    });

    cumulativeDays += s.duration;
  }

  const estimatedClose = addDays(start, cumulativeDays);

  return {
    stages: result,
    estimatedCloseDate: fmtDate(estimatedClose),
    totalDays: cumulativeDays,
  };
}
