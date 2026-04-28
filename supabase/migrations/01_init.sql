-- ============================================================================
-- M&A Platform schema, paste into Supabase SQL Editor and Run
-- Idempotent, safe to re-run
-- ============================================================================

begin;

-- Extensions
create extension if not exists pgcrypto;
create extension if not exists citext;

-- Enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'company_role') then
    create type public.company_role as enum ('owner', 'analyst', 'viewer');
  end if;
  if not exists (select 1 from pg_type where typname = 'upload_status') then
    create type public.upload_status as enum ('uploaded', 'processing', 'parsed', 'needs_input', 'failed', 'stored_only');
  end if;
  if not exists (select 1 from pg_type where typname = 'upload_kind') then
    create type public.upload_kind as enum (
      'general_ledger', 'trial_balance', 'income_statement', 'balance_sheet',
      'cash_flow', 'chart_of_accounts', 'customer_detail', 'ar_aging',
      'ap_aging', 'bank_statement', 'tax_return', 'cim', 'contract', 'other'
    );
  end if;
end$$;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- user_profiles
-- ============================================================================
create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  full_name text,
  avatar_url text,
  brevo_contact_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- companies
-- ============================================================================
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  industry text,
  hq_country text default 'US',
  fiscal_year_end_month int default 12 check (fiscal_year_end_month between 1 and 12),
  currency text not null default 'USD',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index if not exists idx_companies_deleted_at on public.companies(deleted_at) where deleted_at is null;

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ============================================================================
-- company_users
-- ============================================================================
create table if not exists public.company_users (
  company_id uuid not null references public.companies(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.company_role not null default 'viewer',
  added_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (company_id, user_id)
);

create index if not exists idx_company_users_user_id on public.company_users(user_id);

-- ============================================================================
-- uploads, files dropped on /uploads page
-- ============================================================================
create table if not exists public.uploads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  uploaded_by uuid references auth.users(id) on delete set null,
  file_name text not null,
  file_size bigint not null,
  mime_type text,
  r2_key text not null unique,
  kind public.upload_kind not null default 'other',
  status public.upload_status not null default 'uploaded',
  period_start date,
  period_end date,
  parse_metadata jsonb,
  parse_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_uploads_company on public.uploads(company_id, created_at desc);

drop trigger if exists trg_uploads_updated_at on public.uploads;
create trigger trg_uploads_updated_at
  before update on public.uploads
  for each row execute function public.set_updated_at();

-- ============================================================================
-- integrations, accounting system connections
-- ============================================================================
create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null,
  status text not null default 'pending',
  credentials_encrypted text,
  last_sync_at timestamptz,
  last_sync_stats jsonb,
  connected_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, provider)
);

drop trigger if exists trg_integrations_updated_at on public.integrations;
create trigger trg_integrations_updated_at
  before update on public.integrations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- RLS helper functions
-- ============================================================================
create or replace function public.is_company_member(p_company_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.company_users
    where company_id = p_company_id and user_id = auth.uid()
  );
$$;

create or replace function public.company_role(p_company_id uuid)
returns public.company_role language sql stable security definer set search_path = public as $$
  select role from public.company_users
  where company_id = p_company_id and user_id = auth.uid() limit 1;
$$;

create or replace function public.can_write(p_company_id uuid)
returns boolean language sql stable as $$
  select public.company_role(p_company_id) in ('owner', 'analyst');
$$;

create or replace function public.can_admin(p_company_id uuid)
returns boolean language sql stable as $$
  select public.company_role(p_company_id) = 'owner';
$$;

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.user_profiles enable row level security;
alter table public.companies enable row level security;
alter table public.company_users enable row level security;
alter table public.uploads enable row level security;
alter table public.integrations enable row level security;

-- user_profiles
drop policy if exists up_select_self on public.user_profiles;
create policy up_select_self on public.user_profiles
  for select using (id = auth.uid());

drop policy if exists up_select_shared on public.user_profiles;
create policy up_select_shared on public.user_profiles
  for select using (
    exists (
      select 1 from public.company_users a
      join public.company_users b on a.company_id = b.company_id
      where a.user_id = auth.uid() and b.user_id = public.user_profiles.id
    )
  );

drop policy if exists up_update_self on public.user_profiles;
create policy up_update_self on public.user_profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- companies
drop policy if exists co_select_member on public.companies;
create policy co_select_member on public.companies
  for select using (public.is_company_member(id) and deleted_at is null);

drop policy if exists co_insert_any on public.companies;
create policy co_insert_any on public.companies
  for insert with check (auth.uid() is not null);

drop policy if exists co_update_admin on public.companies;
create policy co_update_admin on public.companies
  for update using (public.can_admin(id));

-- company_users
drop policy if exists cu_select_member on public.company_users;
create policy cu_select_member on public.company_users
  for select using (public.is_company_member(company_id));

drop policy if exists cu_insert_admin on public.company_users;
create policy cu_insert_admin on public.company_users
  for insert with check (
    public.can_admin(company_id)
    or (
      user_id = auth.uid()
      and not exists (select 1 from public.company_users where company_id = company_users.company_id)
    )
  );

drop policy if exists cu_update_admin on public.company_users;
create policy cu_update_admin on public.company_users
  for update using (public.can_admin(company_id));

drop policy if exists cu_delete_admin on public.company_users;
create policy cu_delete_admin on public.company_users
  for delete using (public.can_admin(company_id));

-- uploads
drop policy if exists up_select on public.uploads;
create policy up_select on public.uploads
  for select using (public.is_company_member(company_id));

drop policy if exists up_insert on public.uploads;
create policy up_insert on public.uploads
  for insert with check (public.can_write(company_id));

drop policy if exists up_update on public.uploads;
create policy up_update on public.uploads
  for update using (public.can_write(company_id));

drop policy if exists up_delete on public.uploads;
create policy up_delete on public.uploads
  for delete using (public.can_admin(company_id));

-- integrations
drop policy if exists in_select on public.integrations;
create policy in_select on public.integrations
  for select using (public.is_company_member(company_id));

drop policy if exists in_insert on public.integrations;
create policy in_insert on public.integrations
  for insert with check (public.can_admin(company_id));

drop policy if exists in_update on public.integrations;
create policy in_update on public.integrations
  for update using (public.can_admin(company_id));

drop policy if exists in_delete on public.integrations;
create policy in_delete on public.integrations
  for delete using (public.can_admin(company_id));

commit;
