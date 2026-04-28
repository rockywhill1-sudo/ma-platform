import type { CompanySummary, Upload, AppUser } from '@/lib/types';

export const DEMO_USER: AppUser = {
  id: 'demo-user',
  email: 'demo@neuraledge.example',
  full_name: 'Demo User',
};

export const DEMO_COMPANY: CompanySummary = {
  id: 'demo-neuraledge',
  name: 'NeuralEdge AI Group',
  slug: 'neuraledge-ai-group',
  industry: 'Software & AI',
};

export const DEMO_COMPANIES: CompanySummary[] = [DEMO_COMPANY];

// 24 months of revenue and EBITDA, in $K
export const DEMO_REV_24M = [
  { m: 'Apr 24', rev: 760, ebitda: 78 }, { m: 'May 24', rev: 802, ebitda: 88 },
  { m: 'Jun 24', rev: 815, ebitda: 92 }, { m: 'Jul 24', rev: 840, ebitda: 96 },
  { m: 'Aug 24', rev: 875, ebitda: 102 }, { m: 'Sep 24', rev: 910, ebitda: 108 },
  { m: 'Oct 24', rev: 920, ebitda: 110 }, { m: 'Nov 24', rev: 940, ebitda: 112 },
  { m: 'Dec 24', rev: 980, ebitda: 121 }, { m: 'Jan 25', rev: 1020, ebitda: 124 },
  { m: 'Feb 25', rev: 1050, ebitda: 128 }, { m: 'Mar 25', rev: 1085, ebitda: 132 },
  { m: 'Apr 25', rev: 1130, ebitda: 134 }, { m: 'May 25', rev: 1175, ebitda: 142 },
  { m: 'Jun 25', rev: 1210, ebitda: 148 }, { m: 'Jul 25', rev: 1245, ebitda: 152 },
  { m: 'Aug 25', rev: 1280, ebitda: 158 }, { m: 'Sep 25', rev: 1315, ebitda: 164 },
  { m: 'Oct 25', rev: 1340, ebitda: 168 }, { m: 'Nov 25', rev: 1370, ebitda: 168 },
  { m: 'Dec 25', rev: 1410, ebitda: 162 }, { m: 'Jan 26', rev: 1445, ebitda: 168 },
  { m: 'Feb 26', rev: 1480, ebitda: 174 }, { m: 'Mar 26', rev: 1525, ebitda: 184 },
];

export const DEMO_GROWTH = DEMO_REV_24M.slice(12).map((d, i) => ({
  m: d.m,
  growth: Math.round(((d.rev / DEMO_REV_24M[i].rev) - 1) * 100 * 10) / 10,
}));

export const DEMO_GM = [
  { q: 'Q2 24', gm: 44.1 }, { q: 'Q3 24', gm: 44.4 }, { q: 'Q4 24', gm: 44.0 },
  { q: 'Q1 25', gm: 43.5 }, { q: 'Q2 25', gm: 43.9 }, { q: 'Q3 25', gm: 43.8 },
  { q: 'Q4 25', gm: 41.1 }, { q: 'Q1 26', gm: 42.4 },
];

export const DEMO_NRR = [
  { q: 'Q2 24', nrr: 113 }, { q: 'Q3 24', nrr: 116 },
  { q: 'Q4 24', nrr: 118 }, { q: 'Q1 25', nrr: 119 }, { q: 'Q2 25', nrr: 121 },
  { q: 'Q3 25', nrr: 122 }, { q: 'Q4 25', nrr: 123 }, { q: 'Q1 26', nrr: 124 },
];

export const DEMO_CONCENTRATION = [
  { name: 'Helix Bio',           rev: 2614353, pct: 18.4 },
  { name: 'Northwind Logistics', rev: 1278761, pct: 9.0 },
  { name: 'Cascade Health',      rev: 994591,  pct: 7.0 },
  { name: 'Atlas Manufacturing', rev: 781464,  pct: 5.5 },
  { name: 'Bluepeak Capital',    rev: 639380,  pct: 4.5 },
];

export const DEMO_PROJ = [
  { yr: 'Y0', rev: 14.2, ebitda: 3.1 },
  { yr: 'Y1', rev: 17.3, ebitda: 4.0 },
  { yr: 'Y2', rev: 21.1, ebitda: 5.1 },
  { yr: 'Y3', rev: 25.8, ebitda: 6.6 },
  { yr: 'Y4', rev: 31.4, ebitda: 8.4 },
  { yr: 'Y5', rev: 38.4, ebitda: 10.7 },
];

export type DemoSignal = {
  id: string;
  severity: 'high' | 'med' | 'low' | 'positive';
  category: string;
  title: string;
  description: string;
  detected: string;
  confidence?: number;
  cites?: string;
};

export const DEMO_SIGNALS: DemoSignal[] = [
  {
    id: 's1', severity: 'high', category: 'Concentration',
    title: 'Customer concentration risk, Helix Bio at 18.4% of TTM revenue',
    description: "Helix Bio's contribution increased from 12.1% in Q1 2025 to 18.4% in TTM Q1 2026, exceeding the 15% threshold typically flagged by buyers. Contract renews March 2027.",
    detected: '4h ago', confidence: 0.94, cites: '47 invoices',
  },
  {
    id: 's2', severity: 'high', category: 'Anomaly',
    title: 'Unusual journal entry pattern, Q4 2025 month-end',
    description: '12 manual JEs posted on Dec 31, 2025 totaling $284K of revenue. Z-score 3.2 against rolling 24-month baseline. Possible cut-off issue, review before close.',
    detected: '2d ago', confidence: 0.88, cites: '12 GL entries',
  },
  {
    id: 's3', severity: 'high', category: 'Margin',
    title: 'Gross margin compression, 180 bps QoQ',
    description: 'Gross margin compressed from 43.8% (Q3 2025) to 42.0% (Q4 2025) and 42.4% (Q1 2026), driven by 14% YoY increase in third-party AI inference costs.',
    detected: '1w ago', confidence: 0.97, cites: '6 vendor accts',
  },
  {
    id: 's4', severity: 'med', category: 'Working capital',
    title: 'Days sales outstanding trending up',
    description: 'DSO increased from 47 days (Q3 2025) to 61 days (Q1 2026). Three customers, Helix Bio, Atlas Mfg, Cascade Health, account for 78% of the $312K growth in AR.',
    detected: '5d ago', confidence: 0.91,
  },
  {
    id: 's5', severity: 'med', category: 'Vendor',
    title: 'Vendor concentration, OpenAI 31% of COGS',
    description: 'Single-vendor dependency on OpenAI for inference. Pricing or availability changes would directly impact margins. Recommend documenting redundancy plan.',
    detected: '1w ago',
  },
  {
    id: 's6', severity: 'positive', category: 'Retention',
    title: 'Net revenue retention 124%, top quartile',
    description: 'NRR has held above 115% for 6 consecutive quarters, reaching 124% in Q1 2026. Best-in-class for vertical SaaS at this revenue scale.',
    detected: '2w ago',
  },
];

export const DEMO_UPLOADS: Pick<Upload, 'id' | 'file_name' | 'kind' | 'status' | 'file_size' | 'period_start' | 'period_end' | 'created_at'>[] = [
  { id: 'u1', file_name: 'NeuralEdge_GL_2024-2026.xlsx', kind: 'general_ledger', status: 'parsed', file_size: 8200000, period_start: '2024-01-01', period_end: '2026-03-31', created_at: '2026-04-22T10:00:00Z' },
  { id: 'u2', file_name: 'TB_2025_Q4.csv', kind: 'trial_balance', status: 'parsed', file_size: 412000, period_start: '2025-10-01', period_end: '2025-12-31', created_at: '2026-04-22T10:01:00Z' },
  { id: 'u3', file_name: 'P_and_L_FY2025.pdf', kind: 'income_statement', status: 'parsed', file_size: 218000, period_start: '2025-01-01', period_end: '2025-12-31', created_at: '2026-04-22T10:02:00Z' },
  { id: 'u4', file_name: 'BalanceSheet_FY2025.pdf', kind: 'balance_sheet', status: 'parsed', file_size: 194000, period_start: '2025-01-01', period_end: '2025-12-31', created_at: '2026-04-22T10:03:00Z' },
  { id: 'u5', file_name: 'AR_Aging_Mar2026.pdf', kind: 'ar_aging', status: 'needs_input', file_size: 86000, period_start: '2026-03-01', period_end: '2026-03-31', created_at: '2026-04-22T10:04:00Z' },
  { id: 'u6', file_name: 'Bank_Stmt_Wells_Mar2026.pdf', kind: 'bank_statement', status: 'processing', file_size: 2400000, period_start: '2026-03-01', period_end: '2026-03-31', created_at: '2026-04-22T10:05:00Z' },
  { id: 'u7', file_name: 'CIM_Project_Nightingale.pdf', kind: 'cim', status: 'stored_only', file_size: 12800000, period_start: null, period_end: null, created_at: '2026-04-22T10:06:00Z' },
];
