/**
 * Signal detection engine - expanded version.
 * Detects 15 signal types across financial, operational, and risk categories.
 *
 * Some signals require additional data files (customer detail, AR/AP aging, balance sheet).
 * Those signals only fire when the data is present.
 */

import type { PeriodSummary, PLLineItem } from '@/lib/queries';

export type SignalSeverity = 'high' | 'med' | 'low' | 'positive';

export type Signal = {
  id: string;
  category: string;
  title: string;
  description: string;
  severity: SignalSeverity;
  detected: string;
  confidence: number | null;
  evidence: string[];
};

function pct(n: number, d: number): number {
  return d === 0 ? 0 : (n / d) * 100;
}

function bps(curr: number | null | undefined, prev: number | null | undefined): number | null {
  if (curr == null || prev == null) return null;
  return (Number(curr) - Number(prev)) * 100;
}

export function detectSignals(
  summaries: PeriodSummary[],
  lineItems: PLLineItem[]
): Signal[] {
  const signals: Signal[] = [];
  const today = new Date().toISOString().split('T')[0];

  if (summaries.length === 0) return signals;

  if (summaries.length === 1) {
    signals.push({
      id: 'single-period',
      category: 'Data quality',
      title: 'Only one period of data, no trends available',
      description: 'Upload at least 4 quarters of financial data to detect margin trends, revenue acceleration, and other signals.',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Single period: ' + summaries[0].period_label],
    });
    return signals;
  }

  // ─── Profitability signals ────────────────────────────────────

  // Margin compression / expansion
  const recentSummaries = summaries.slice(-4);
  if (recentSummaries.length >= 2) {
    const first = recentSummaries[0];
    const last = recentSummaries[recentSummaries.length - 1];
    const marginDelta = bps(last.gross_margin_pct, first.gross_margin_pct);

    if (marginDelta != null) {
      if (marginDelta <= -200) {
        signals.push({
          id: 'margin-compression',
          category: 'Profitability',
          title: 'Gross margin compressed ' + Math.abs(Math.round(marginDelta)) + ' bps over recent periods',
          description: 'Gross margin declined from ' + Number(first.gross_margin_pct).toFixed(1) + '% in ' + first.period_label + ' to ' + Number(last.gross_margin_pct).toFixed(1) + '% in ' + last.period_label + '. Investigate input cost increases or pricing changes.',
          severity: 'high',
          detected: today,
          confidence: 0.92,
          evidence: recentSummaries.map((s) => s.period_label + ': ' + Number(s.gross_margin_pct ?? 0).toFixed(1) + '%'),
        });
      } else if (marginDelta <= -50) {
        signals.push({
          id: 'margin-soft-compression',
          category: 'Profitability',
          title: 'Modest gross margin compression, ' + Math.abs(Math.round(marginDelta)) + ' bps',
          description: 'Gross margin declined slightly across recent periods. Worth monitoring but not alarming on its own.',
          severity: 'med',
          detected: today,
          confidence: 0.76,
          evidence: recentSummaries.map((s) => s.period_label + ': ' + Number(s.gross_margin_pct ?? 0).toFixed(1) + '%'),
        });
      } else if (marginDelta >= 200) {
        signals.push({
          id: 'margin-expansion',
          category: 'Profitability',
          title: 'Gross margin expanded ' + Math.round(marginDelta) + ' bps',
          description: 'Gross margin improved from ' + Number(first.gross_margin_pct).toFixed(1) + '% in ' + first.period_label + ' to ' + Number(last.gross_margin_pct).toFixed(1) + '% in ' + last.period_label + '. Could indicate pricing power or operational leverage.',
          severity: 'positive',
          detected: today,
          confidence: 0.88,
          evidence: recentSummaries.map((s) => s.period_label + ': ' + Number(s.gross_margin_pct ?? 0).toFixed(1) + '%'),
        });
      }
    }

    // EBITDA margin compression
    const ebMarginDelta = bps(last.ebitda_margin_pct, first.ebitda_margin_pct);
    if (ebMarginDelta != null && ebMarginDelta <= -300) {
      signals.push({
        id: 'ebitda-compression',
        category: 'Profitability',
        title: 'EBITDA margin compressed ' + Math.abs(Math.round(ebMarginDelta)) + ' bps',
        description: 'EBITDA margin moved from ' + Number(first.ebitda_margin_pct).toFixed(1) + '% to ' + Number(last.ebitda_margin_pct).toFixed(1) + '%. Cost discipline questions are likely.',
        severity: 'high',
        detected: today,
        confidence: 0.85,
        evidence: recentSummaries.map((s) => s.period_label + ': ' + Number(s.ebitda_margin_pct ?? 0).toFixed(1) + '%'),
      });
    }
  }

  // ─── Growth signals ───────────────────────────────────────────

  if (summaries.length >= 2) {
    const growthRates: number[] = [];
    for (let i = 1; i < summaries.length; i++) {
      const prevRev = Number(summaries[i - 1].revenue);
      const currRev = Number(summaries[i].revenue);
      if (prevRev > 0) growthRates.push(pct(currRev - prevRev, prevRev));
    }

    if (growthRates.length > 0) {
      const lastGrowth = growthRates[growthRates.length - 1];
      const avgGrowth = growthRates.reduce((s, g) => s + g, 0) / growthRates.length;

      if (lastGrowth < 0) {
        signals.push({
          id: 'revenue-decline',
          category: 'Growth',
          title: 'Revenue declined ' + Math.abs(lastGrowth).toFixed(1) + '% in latest period',
          description: 'Revenue fell from $' + Number(summaries[summaries.length - 2].revenue).toLocaleString() + ' to $' + Number(summaries[summaries.length - 1].revenue).toLocaleString() + '. Validate seasonality, customer churn, or one-time effects.',
          severity: 'high',
          detected: today,
          confidence: 0.95,
          evidence: ['Prior period: $' + Number(summaries[summaries.length - 2].revenue).toLocaleString(), 'Latest period: $' + Number(summaries[summaries.length - 1].revenue).toLocaleString()],
        });
      } else if (lastGrowth > avgGrowth + 5 && growthRates.length >= 3) {
        signals.push({
          id: 'revenue-acceleration',
          category: 'Growth',
          title: 'Revenue growth accelerating, latest period at +' + lastGrowth.toFixed(1) + '%',
          description: 'Latest period growth materially exceeds the recent average of +' + avgGrowth.toFixed(1) + '%. Worth understanding the drivers.',
          severity: 'positive',
          detected: today,
          confidence: 0.82,
          evidence: growthRates.map((g, i) => summaries[i + 1].period_label + ': ' + (g >= 0 ? '+' : '') + g.toFixed(1) + '%'),
        });
      }

      // Q4 revenue spike (potential accelerated bookings)
      if (summaries.length >= 4) {
        const last = summaries[summaries.length - 1];
        const isQ4 = (last.period_label || '').toUpperCase().includes('Q4');
        if (isQ4 && lastGrowth > 25) {
          signals.push({
            id: 'q4-spike',
            category: 'Revenue quality',
            title: 'Large Q4 revenue spike detected, +' + lastGrowth.toFixed(1) + '% over Q3',
            description: 'Q4 revenue surge of more than 25% may indicate accelerated bookings, channel-stuffing, or year-end discounting. Validate with customer-level revenue detail.',
            severity: 'med',
            detected: today,
            confidence: 0.7,
            evidence: ['Q3: $' + Number(summaries[summaries.length - 2].revenue).toLocaleString(), last.period_label + ': $' + Number(last.revenue).toLocaleString()],
          });
        }
      }

      // Seasonality detection - high coefficient of variation across periods
      if (growthRates.length >= 4) {
        const max = Math.max(...growthRates);
        const min = Math.min(...growthRates);
        if ((max - min) > 30) {
          signals.push({
            id: 'seasonality',
            category: 'Revenue quality',
            title: 'Material seasonality detected in revenue',
            description: 'Period-over-period growth ranges from ' + min.toFixed(1) + '% to ' + max.toFixed(1) + '%. Build seasonal model into forecasts and avoid annualizing single quarters.',
            severity: 'low',
            detected: today,
            confidence: 0.68,
            evidence: ['Range: ' + min.toFixed(1) + '% to ' + max.toFixed(1) + '%'],
          });
        }
      }
    }
  }

  // ─── Cost structure signals ───────────────────────────────────

  const totalRevenue = summaries.reduce((s, p) => s + Number(p.revenue), 0);
  const totalOpex = summaries.reduce((s, p) => s + Number(p.opex), 0);
  const opexRatio = totalRevenue > 0 ? (totalOpex / totalRevenue) * 100 : 0;

  if (opexRatio > 35) {
    signals.push({
      id: 'high-opex',
      category: 'Cost structure',
      title: 'Operating expenses run at ' + opexRatio.toFixed(1) + '% of revenue',
      description: 'OpEx ratio is elevated. For comparison, software and services businesses typically run 25-30% of revenue in OpEx. Review G&A and S&M efficiency.',
      severity: 'med',
      detected: today,
      confidence: 0.75,
      evidence: ['Total revenue: $' + totalRevenue.toLocaleString(), 'Total OpEx: $' + totalOpex.toLocaleString()],
    });
  }

  // COGS volatility
  if (summaries.length >= 3) {
    const cogsRatios = summaries.map((s) =>
      Number(s.revenue) > 0 ? (Number(s.cogs) / Number(s.revenue)) * 100 : 0
    );
    const maxCogs = Math.max(...cogsRatios);
    const minCogs = Math.min(...cogsRatios);
    const cogsRange = maxCogs - minCogs;

    if (cogsRange > 5) {
      signals.push({
        id: 'cogs-volatility',
        category: 'Cost structure',
        title: 'Cost of revenue ratio swings ' + cogsRange.toFixed(1) + ' percentage points',
        description: 'COGS as a percent of revenue is not stable across periods. Could indicate inventory accounting issues, vendor pricing volatility, or revenue mix shifts.',
        severity: 'med',
        detected: today,
        confidence: 0.7,
        evidence: cogsRatios.map((r, i) => summaries[i].period_label + ': ' + r.toFixed(1) + '%'),
      });
    }
  }

  // ─── Earnings quality signals ─────────────────────────────────

  // Revenue mix shift - SaaS/recurring vs services
  const revenueLineItems = lineItems.filter((l) => l.category === 'revenue');
  if (revenueLineItems.length > 1) {
    // Group by raw_label and look for shifts
    const labels = new Set(revenueLineItems.map((l) => l.raw_label));
    if (labels.size >= 2) {
      const periodTotals: Record<string, Record<string, number>> = {};
      for (const l of revenueLineItems) {
        if (!periodTotals[l.period_label]) periodTotals[l.period_label] = {};
        periodTotals[l.period_label][l.raw_label] = (periodTotals[l.period_label][l.raw_label] || 0) + Number(l.amount);
      }
      const periods = Object.keys(periodTotals).sort();
      if (periods.length >= 2) {
        const firstPeriodMix = periodTotals[periods[0]];
        const lastPeriodMix = periodTotals[periods[periods.length - 1]];
        const firstTotal = Object.values(firstPeriodMix).reduce((a, b) => a + b, 0);
        const lastTotal = Object.values(lastPeriodMix).reduce((a, b) => a + b, 0);

        let maxShift = 0;
        let shiftLabel = '';
        for (const label of labels) {
          const firstPct = firstTotal > 0 ? ((firstPeriodMix[label] || 0) / firstTotal) * 100 : 0;
          const lastPct = lastTotal > 0 ? ((lastPeriodMix[label] || 0) / lastTotal) * 100 : 0;
          const shift = Math.abs(firstPct - lastPct);
          if (shift > maxShift) {
            maxShift = shift;
            shiftLabel = label;
          }
        }

        if (maxShift > 10) {
          signals.push({
            id: 'revenue-mix-shift',
            category: 'Revenue quality',
            title: 'Revenue mix shifted materially across periods',
            description: '"' + shiftLabel + '" share of revenue changed by ' + maxShift.toFixed(1) + ' percentage points. Different revenue types have different valuation multiples - investigate the driver.',
            severity: 'med',
            detected: today,
            confidence: 0.72,
            evidence: ['Largest shift: ' + shiftLabel, 'Shift magnitude: ' + maxShift.toFixed(1) + ' pp'],
          });
        }
      }
    }
  }

  // ─── Awaiting-data signals (require additional file uploads) ──

  const hasCustomerData = lineItems.some((l) => (l.raw_label || '').toLowerCase().includes('customer'));
  const hasBalanceSheet = false; // No balance sheet parser yet
  const hasARData = false;

  if (!hasCustomerData) {
    signals.push({
      id: 'awaiting-customer-concentration',
      category: 'Awaiting data',
      title: 'Customer concentration analysis available with customer data',
      description: 'Upload a "Sales by Customer" or "Customer Detail" report to detect concentration risk (top customer % of revenue, top 10% of revenue).',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: Sales by Customer Summary'],
    });

    signals.push({
      id: 'awaiting-vendor-concentration',
      category: 'Awaiting data',
      title: 'Vendor concentration analysis available with vendor data',
      description: 'Upload "AP Aging" or "Vendor Detail" to flag vendor dependency risk.',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: AP Aging or Vendor Detail report'],
    });
  }

  if (!hasBalanceSheet) {
    signals.push({
      id: 'awaiting-working-capital',
      category: 'Awaiting data',
      title: 'Working capital analysis available with balance sheet',
      description: 'Upload Balance Sheet by quarter to detect working capital deterioration, cash conversion cycle changes, and inventory buildup.',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: Balance Sheet (quarterly columns)'],
    });

    signals.push({
      id: 'awaiting-cash-burn',
      category: 'Awaiting data',
      title: 'Cash burn detection available with balance sheet',
      description: 'Upload Balance Sheet to detect cash position deterioration period over period.',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: Balance Sheet'],
    });
  }

  if (!hasARData) {
    signals.push({
      id: 'awaiting-dso-trend',
      category: 'Awaiting data',
      title: 'DSO trend analysis available with AR aging',
      description: 'Upload AR Aging Summary by quarter to detect collection deterioration (days sales outstanding trending up).',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: AR Aging Summary'],
    });

    signals.push({
      id: 'awaiting-bad-debt',
      category: 'Awaiting data',
      title: 'Bad debt risk detection requires AR aging data',
      description: 'Upload AR Aging to detect concentrations in 60+, 90+ day buckets indicating collection issues.',
      severity: 'low',
      detected: today,
      confidence: null,
      evidence: ['Required: AR Aging Summary'],
    });
  }

  signals.push({
    id: 'awaiting-owner-expenses',
    category: 'Awaiting data',
    title: 'Owner expense / addback analysis available with general ledger',
    description: 'Upload General Ledger detail to identify owner-related discretionary expenses for EBITDA addback.',
    severity: 'low',
    detected: today,
    confidence: null,
    evidence: ['Required: General Ledger detail'],
  });

  signals.push({
    id: 'awaiting-recurring-mix',
    category: 'Awaiting data',
    title: 'Recurring vs one-time revenue mix detection',
    description: 'Categorize revenue lines as recurring or one-time to flag valuation-sensitive mix shifts. Currently using account labels only.',
    severity: 'low',
    detected: today,
    confidence: null,
    evidence: ['Suggested: Add custom revenue categories in admin'],
  });

  signals.push({
    id: 'awaiting-accrual-quality',
    category: 'Awaiting data',
    title: 'Accrual quality / one-time gain detection',
    description: 'Detect material one-time gains, unusual non-operating income, or aggressive revenue recognition. Requires general ledger detail.',
    severity: 'low',
    detected: today,
    confidence: null,
    evidence: ['Required: General Ledger detail'],
  });

  signals.push({
    id: 'awaiting-capitalization',
    category: 'Awaiting data',
    title: 'Aggressive capitalization detection',
    description: 'Flags expenses inappropriately moved to balance sheet (capitalized R&D, deferred costs). Needs balance sheet + GL.',
    severity: 'low',
    detected: today,
    confidence: null,
    evidence: ['Required: Balance Sheet + General Ledger'],
  });

  // Sort: high → med → low → positive (positive last so it doesn't look alarming)
  // BUT awaiting-data should sort last
  const order: Record<SignalSeverity, number> = { high: 0, med: 1, low: 2, positive: 3 };
  signals.sort((a, b) => {
    const aAwaiting = a.category === 'Awaiting data' ? 1 : 0;
    const bAwaiting = b.category === 'Awaiting data' ? 1 : 0;
    if (aAwaiting !== bAwaiting) return aAwaiting - bAwaiting;
    return order[a.severity] - order[b.severity];
  });

  return signals;
}
