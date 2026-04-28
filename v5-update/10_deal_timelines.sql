-- ============================================================================
-- Migration 10: Deal timelines
-- Run after 09_themes.sql
-- ============================================================================

begin;

create table if not exists public.deal_timelines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  start_date date not null,
  estimated_close_date date,
  current_stage text default 'sourcing',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_deal_timelines_company on public.deal_timelines(company_id);

drop trigger if exists trg_deal_timelines_updated_at on public.deal_timelines;
create trigger trg_deal_timelines_updated_at
  before update on public.deal_timelines
  for each row execute function public.set_updated_at();

alter table public.deal_timelines disable row level security;

commit;
