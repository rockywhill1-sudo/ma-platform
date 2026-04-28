'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getPeriodSummaries, getPLLineItems, getCompanyById } from '@/lib/queries';
import { detectSignals } from '@/lib/signals-engine';

const TITLES: Record<string, string> = {
  qoe_summary: 'Quality of Earnings Summary',
  diligence_summary: 'Diligence Summary',
  investor_brief: 'Investor Brief',
  valuation_memo: 'Valuation Memo',
  customer_concentration: 'Customer Concentration Analysis',
  working_capital_norm: 'Working Capital Normalization',
  ebitda_bridge: 'EBITDA Bridge & Addbacks',
  pro_forma_memo: 'Pro Forma Adjustments Memo',
  ic_memo: 'Investment Committee Memo',
  lender_package: 'Lender Package',
  earnout_tracker: 'Earnout Tracker',
};

const PAGE_COUNTS: Record<string, number> = {
  qoe_summary: 8,
  diligence_summary: 4,
  investor_brief: 2,
  valuation_memo: 4,
  customer_concentration: 5,
  working_capital_norm: 4,
  ebitda_bridge: 3,
  pro_forma_memo: 4,
  ic_memo: 6,
  lender_package: 8,
  earnout_tracker: 3,
};

export async function generateReport(formData: FormData) {
  const companyId = formData.get('company_id') as string;
  const kind = (formData.get('kind') as string) || 'qoe_summary';

  if (!companyId) return;

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const company = await getCompanyById(companyId);
  if (!company) return;

  const summaries = await getPeriodSummaries(companyId);
  const lineItems = await getPLLineItems(companyId);
  const signals = detectSignals(summaries, lineItems);

  const recent = summaries.slice(-4);
  const ttmRevenue = recent.reduce((s, p) => s + Number(p.revenue), 0);
  const ttmEbitda = recent.reduce((s, p) => s + Number(p.ebitda), 0);
  const ttmGrossProfit = recent.reduce((s, p) => s + Number(p.gross_profit), 0);

  const snapshot = {
    company: { name: company.name, industry: company.industry },
    generated_at: new Date().toISOString(),
    headline: {
      ttm_revenue: ttmRevenue,
      ttm_ebitda: ttmEbitda,
      ttm_gross_profit: ttmGrossProfit,
      ttm_gross_margin_pct: ttmRevenue > 0 ? (ttmGrossProfit / ttmRevenue) * 100 : null,
      ttm_ebitda_margin_pct: ttmRevenue > 0 ? (ttmEbitda / ttmRevenue) * 100 : null,
      periods_count: summaries.length,
    },
    summaries,
    signals,
    kind,
  };

  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      company_id: companyId,
      created_by: user.id,
      kind,
      title: TITLES[kind] || 'Report',
      snapshot,
      page_count: PAGE_COUNTS[kind] ?? 4,
    })
    .select('id')
    .single();

  if (error || !report) return;

  revalidatePath(`/companies/${companyId}/reports`);
  redirect(`/companies/${companyId}/reports/${report.id}`);
}

export async function deleteReport(formData: FormData) {
  const reportId = formData.get('report_id') as string;
  const companyId = formData.get('company_id') as string;
  if (!reportId) return;

  const supabase = await createClient();
  await supabase.from('reports').delete().eq('id', reportId);
  revalidatePath(`/companies/${companyId}/reports`);
}
