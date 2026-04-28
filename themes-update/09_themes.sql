-- ============================================================================
-- Migration 09: Tagline + theme
-- ============================================================================

begin;

insert into public.app_settings (key, value) values
  ('platform_tagline', 'by NeuralEdge'),
  ('color_theme', 'default')
on conflict (key) do nothing;

commit;
