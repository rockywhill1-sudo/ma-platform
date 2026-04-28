import { createClient } from '@/lib/supabase/server';
import type { Company, CompanySummary, Upload, AppUser } from '@/lib/types';

export async function getCurrentUser(): Promise<AppUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from('user_profiles').select('first_name, last_name').eq('user_id', user.id).maybeSingle();
  const first = (profile?.first_name ?? '').trim();
  const last = (profile?.last_name ?? '').trim();
  let fullName = (first + ' ' + last).trim();
  if (!fullName) fullName = user.email?.split('@')[0] ?? 'User';
  return {
    id: user.id,
    email: user.email ?? '',
    full_name: fullName,
  };
}

export async function getCompaniesForCurrentUser(): Promise<CompanySummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('companies').select('id, name, slug, industry').order('name');
  if (error) return [];
  return data ?? [];
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = await createClient();
  const { data } = await supabase.from('companies').select('*').eq('id', id).is('deleted_at', null).single();
  return data as Company | null;
}

export async function getUploads(companyId: string): Promise<Upload[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('uploads').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
  return (data as Upload[]) ?? [];
}

export type PeriodSummary = {
  id: string;
  period_label: string;
  period_start: string | null;
  period_end: string;
  revenue: number;
  cogs: number;
  gross_profit: number;
  opex: number;
  ebitda: number;
  gross_margin_pct: number | null;
  ebitda_margin_pct: number | null;
};

export async function getPeriodSummaries(companyId: string): Promise<PeriodSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('period_summaries')
    .select('*')
    .eq('company_id', companyId)
    .order('period_end', { ascending: true });
  return (data as PeriodSummary[]) ?? [];
}

export type PLLineItem = {
  id: string;
  raw_label: string;
  category: string;
  period_label: string;
  period_end: string | null;
  amount: number;
};

export async function getPLLineItems(companyId: string): Promise<PLLineItem[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('pl_line_items')
    .select('id, raw_label, category, period_label, period_end, amount')
    .eq('company_id', companyId)
    .order('period_end', { ascending: true });
  return (data as PLLineItem[]) ?? [];
}

export async function hasFinancialData(companyId: string): Promise<boolean> {
  const supabase = await createClient();
  const { count } = await supabase
    .from('period_summaries')
    .select('id', { count: 'exact', head: true })
    .eq('company_id', companyId);
  return (count ?? 0) > 0;
}
