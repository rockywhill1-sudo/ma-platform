-- Tweaks: clear "No credit card required" subtext
update public.app_settings set value = '' where key = 'hero_subtext';
