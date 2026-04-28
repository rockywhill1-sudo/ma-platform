-- ============================================================================
-- Migration 06: Site content keys (uses existing app_settings table)
-- Run after 05_app_settings.sql
-- Idempotent
-- ============================================================================

begin;

insert into public.app_settings (key, value) values
  ('hero_headline', 'Investor-grade M&A intelligence,'),
  ('hero_headline_2', 'for every stage of the deal.'),
  ('hero_subheadline', 'Connect accounting systems or upload financials directly. Get normalized P&L, anomaly detection, signals, and investor-grade reports automatically.'),
  ('hero_demo_button', 'Try the demo'),
  ('hero_signup_button', 'Get started'),
  ('hero_subtext', 'No credit card required'),
  ('nav_demo_link', 'Demo'),
  ('nav_signin_link', 'Sign in'),
  ('nav_signup_link', 'Sign up')
on conflict (key) do nothing;

commit;
