-- ============================================================================
-- Migration 05: Global app settings
-- Run after 04_checklists.sql
-- Idempotent
-- ============================================================================

begin;

create table if not exists public.app_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_app_settings_updated_at on public.app_settings;
create trigger trg_app_settings_updated_at
  before update on public.app_settings
  for each row execute function public.set_updated_at();

-- Seed defaults
insert into public.app_settings (key, value) values
  ('platform_name', 'M&A Platform'),
  ('browser_title', 'M&A Platform'),
  ('footer_text', '© M&A Platform. All numbers verified against source documents.'),
  ('admin_user_ids', '')
on conflict (key) do nothing;

alter table public.app_settings disable row level security;

commit;
