# Three small tweaks

1. Checklists default to **collapsed** (instead of expanded)
2. Disclaimer page footer changed to **NeuralEdge**
3. Removed **"No credit card required"** subtext from landing page

## Step 1 - One small SQL

Supabase SQL Editor → paste:

```sql
update public.app_settings set value = '' where key = 'hero_subtext';
```

→ Run.

## Step 2 - Upload + extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `tweaks-update.tar.gz`.

Terminal:

```
tar -xzf tweaks-update.tar.gz && \
cp tweaks-update/checklist-group.tsx src/components/pages/checklist-group.tsx && \
cp tweaks-update/disclaimer-page.tsx src/app/disclaimer/page.tsx && \
cp tweaks-update/landing-page.tsx src/app/page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## Notes

- You can still edit hero subtext from Admin → Landing page content if you want to put something else there later.
- Checklists collapsed-by-default means tasks are hidden until you click. If you print, the print CSS auto-expands all so the printed copy includes everything.
