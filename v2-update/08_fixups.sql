-- ============================================================================
-- Migration 08: Fix user_profiles + add new report types
-- ============================================================================

begin;

-- Ensure user_profiles has correct unique constraint on user_id
update public.user_profiles set user_id = id where user_id is null;

-- Drop the old constraint if it exists, recreate clean
alter table public.user_profiles drop constraint if exists user_profiles_user_id_key;
alter table public.user_profiles add constraint user_profiles_user_id_key unique (user_id);

-- Add new report types to the enum
do $$
begin
  -- Add each new value if not already present
  begin alter type public.report_kind add value if not exists 'customer_concentration'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'working_capital_norm'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'ebitda_bridge'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'pro_forma_memo'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'ic_memo'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'lender_package'; exception when duplicate_object then null; end;
  begin alter type public.report_kind add value if not exists 'earnout_tracker'; exception when duplicate_object then null; end;
end $$;

commit;
