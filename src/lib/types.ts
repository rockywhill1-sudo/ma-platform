export type CompanyRole = 'owner' | 'analyst' | 'viewer';

export type Company = {
  id: string;
  name: string;
  slug: string;
  industry: string | null;
  hq_country: string | null;
  fiscal_year_end_month: number;
  currency: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CompanySummary = Pick<Company, 'id' | 'name' | 'slug' | 'industry'>;

export type UploadKind =
  | 'general_ledger' | 'trial_balance' | 'income_statement' | 'balance_sheet'
  | 'cash_flow' | 'chart_of_accounts' | 'customer_detail' | 'ar_aging'
  | 'ap_aging' | 'bank_statement' | 'tax_return' | 'cim' | 'contract' | 'other';

export type UploadStatus =
  | 'uploaded' | 'processing' | 'parsed' | 'needs_input' | 'failed' | 'stored_only';

export type Upload = {
  id: string;
  company_id: string;
  uploaded_by: string | null;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  r2_key: string;
  kind: UploadKind;
  status: UploadStatus;
  period_start: string | null;
  period_end: string | null;
  parse_metadata: unknown;
  parse_error: string | null;
  parse_status: 'pending' | 'success' | 'failed' | null;
  rows_parsed: number | null;
  periods_detected: number | null;
  created_at: string;
  updated_at: string;
};

export type AppUser = {
  id: string;
  email: string;
  full_name: string;
};
