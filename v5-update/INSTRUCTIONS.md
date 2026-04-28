# V5 update — Deal Timeline + sprucier tables/charts + theme diagnosis

## What this delivers

1. **Deal Timeline page** - new page at /companies/[id]/timeline
   - Enter a deal start date
   - Enter your current stage
   - Get an estimated close date
   - Diligence auto-extends by 7 days per high-risk signal, 3 days per medium
   - Visual timeline with status icons (complete, current, pending)
2. **Sprucier financial tables** - gradient header, alternating rows, icons in left column, colored emphasis rows for Revenue / Gross Profit / EBITDA
3. **Sprucier charts** - gradient stroke, custom tooltip with rounded edges and shadow, themed dots
4. **Theme diagnosis** - I am being honest: I have not solved the theme bug yet. Step 5 below has 1 SQL query that will tell me exactly what is wrong so I can fix it for real on the next pass.

## Step 1 - SQL migration

Supabase SQL Editor → paste contents of `10_deal_timelines.sql` → Run.

## Step 2 - Upload + extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `v5-update.tar.gz`.

Terminal:

```
tar -xzf v5-update.tar.gz && \
cp v5-update/themes.ts src/lib/themes.ts && \
cp v5-update/layout.tsx src/app/layout.tsx && \
cp v5-update/sidebar.tsx src/components/layout/sidebar.tsx && \
cp v5-update/timeline-engine.ts src/lib/timeline-engine.ts && \
mkdir -p "src/app/companies/[companyId]/timeline" && \
cp v5-update/timeline-route.tsx "src/app/companies/[companyId]/timeline/page.tsx" && \
cp v5-update/timeline-actions.ts "src/app/companies/[companyId]/timeline/actions.ts" && \
cp v5-update/real-charts.tsx src/components/pages/real-charts.tsx && \
cp v5-update/real-financials-page.tsx src/components/pages/real-financials-page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## Step 4 - Test what works

After deploy:

1. **Timeline page**: Click "Timeline" in the Deal section of the sidebar. Set a start date, pick a stage, save. You will see the full deal timeline computed from your start date with estimated close date.

2. **Financials page**: Spruced up. Revenue/Gross Profit/EBITDA rows have colored gradient backgrounds with icons. Hover to see row highlighting.

3. **Charts**: Use a primary→accent gradient, sit on a dashed grid, with a custom rounded tooltip.

## Step 5 - DIAGNOSE the theme bug (please do this)

I have not fixed themes for real. I have tried 3 times now. Each time I added more aggressive CSS specificity hoping it would land. That is not a fix, that is guessing. Run this in Supabase SQL Editor:

```sql
select key, value from public.app_settings where key = 'color_theme';
```

And tell me what it returns:

- **If it returns nothing or "default"**: the save is not writing to the DB. The problem is in the server action.
- **If it returns "forest" or whatever you tried picking**: the save IS working. The problem is the layout reading from cache. I need to add a different cache-busting strategy.

This 1 query tells me which side of the wall the bug is on. Then I will fix it correctly on the next pass.

## Notes

The chart improvements use CSS custom properties (`hsl(var(--primary))`) so they will automatically follow whatever theme you have active once themes work.

The Timeline auto-detects current stage from "today" if you do not set it explicitly. When you do set it, that takes priority.
