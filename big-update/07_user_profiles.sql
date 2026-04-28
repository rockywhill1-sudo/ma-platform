-- ============================================================================
-- Migration 07: Logo URL setting, user display names, team members stub
-- Run after 06_site_content.sql
-- Idempotent
-- ============================================================================

begin;

-- Logo URL is just another app_settings key
insert into public.app_settings (key, value) values
  ('logo_url', '')
on conflict (key) do nothing;

-- User profiles store the first/last name beyond just the auth email
create table if not exists public.user_profiles (
  user_id uuid primary key,
  first_name text,
  last_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

alter table public.user_profiles disable row level security;

-- Workspace team_members view-stub
-- This is the stub - real invite flow happens in a future migration
create table if not exists public.workspace_invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  email text not null,
  role text not null default 'viewer',
  invited_by uuid,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

create index if not exists idx_invites_company on public.workspace_invites(company_id);

alter table public.workspace_invites disable row level security;

commit;
