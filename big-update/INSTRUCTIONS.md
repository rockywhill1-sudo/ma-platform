# Big update — vibrant landing, top bar, signals filter, references rewrite, profile, team stub, email reports, logo

This bundles all 7 changes you asked for plus the demo navigation fix.

## What's in this update

1. **Demo navigation actually fixed** - URL-aware, links inside demo work properly
2. **Smaller sidebar** - tighter spacing, smaller font
3. **Workspace name moved to top bar** (left side) instead of sidebar
4. **User menu top-right corner** with name + dropdown (Edit profile, Sign out)
5. **First/last name fields** on user profile (replaces email-as-name)
6. **Logo upload** - paste any logo URL in admin, used in sidebar + landing + report covers
7. **Vibrant landing page** - gradients, feature columns, stats, CTA section
8. **Matching login page** - branded gradient sidebar
9. **15 signal types** - margin/EBITDA/revenue/Q4 spike/seasonality/mix shift + 9 awaiting-data signals
10. **Severity filter** on Signals page (All / High / Medium / Low / Positive / Awaiting data)
11. **References page rewrite** - 3 columns, search box, jump-to anchors, grouped by category
12. **Email reports** - send any report to any email via Brevo, recipient gets clickable link
13. **Team Members stub** in admin - invite form records pending invites (full flow next session)
14. **Removed Presentation Mode** from real dashboard

## Step 1 - SQL migration

Supabase SQL Editor → paste contents of `07_user_profiles.sql` → Run.

This adds: logo_url to app_settings, user_profiles table (first_name/last_name), workspace_invites table.

## Step 2 - Upload and extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `big-update.tar.gz`.

In a terminal, paste this whole block:

```
tar -xzf big-update.tar.gz && \
cp big-update/settings.ts src/lib/settings.ts && \
cp big-update/queries-index.ts src/lib/queries/index.ts && \
cp big-update/actions.ts src/app/actions.ts && \
cp big-update/middleware.ts src/lib/supabase/middleware.ts && \
cp big-update/landing-page.tsx src/app/page.tsx && \
cp big-update/login-page.tsx src/app/login/page.tsx && \
cp big-update/demo-page.tsx src/app/demo/page.tsx && \
cp big-update/sidebar.tsx src/components/layout/sidebar.tsx && \
cp big-update/top-bar.tsx src/components/layout/top-bar.tsx && \
cp big-update/shell.tsx src/components/layout/shell.tsx && \
cp big-update/company-layout.tsx "src/app/companies/[companyId]/layout.tsx" && \
cp big-update/dashboard-actions.tsx src/components/pages/dashboard-actions.tsx && \
cp big-update/real-dashboard-page.tsx src/components/pages/real-dashboard-page.tsx && \
cp big-update/signals-engine.ts src/lib/signals-engine.ts && \
cp big-update/signals-filter.tsx src/components/pages/signals-filter.tsx && \
cp big-update/real-signals-page.tsx src/components/pages/real-signals-page.tsx && \
cp big-update/signals-route.tsx "src/app/companies/[companyId]/signals/page.tsx" && \
cp big-update/references-page.tsx src/components/pages/references-page.tsx && \
cp big-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
cp big-update/print-button.tsx src/components/pages/print-button.tsx && \
cp big-update/report-view.tsx src/components/pages/report-view.tsx && \
cp big-update/email-report-form.tsx src/components/pages/email-report-form.tsx && \
mkdir -p src/app/profile && \
cp big-update/profile-page.tsx src/app/profile/page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

Make sure token is loaded:
```
source ~/.cf-token.sh
echo $CLOUDFLARE_API_TOKEN | head -c 10
```

Should print `cfut_xxxxxx`. Then:

```
pnpm run deploy
```

## Step 4 - First-time setup at mergers.neaigroup.com

After deploy completes, do these in order:

1. Visit mergers.neaigroup.com and sign in
2. Click your name (top right) → **Edit profile** → set First and Last name → Save
3. Visit Admin (sidebar), under Platform branding:
   - Paste a logo URL if you have one (PNG/SVG, square preferred). Free hosting tip: imgur.com, ImgBB, or use a Supabase Storage bucket.
   - Set Platform name (e.g., "NEAI Mergers" or whatever you want)
   - Set Browser tab title
4. Save branding
5. Visit Signals page → try the filter chips at top (All / High / Medium / Low / Positive / Awaiting data)
6. Visit M&A References → try the search box, see 3 columns by category
7. Visit Reports → click into one of your reports → click "Email report" → send yourself a test email

## Notes

**Logo hosting**: This update uses URLs only (you paste a URL). True file upload to R2 requires more code and adds complexity. URL-paste is sufficient for now - upload your logo to imgur or any image host, paste URL, done.

**Email reports**: Currently the report URL is public-by-link (anyone with the URL can view). If you need access control on emailed reports, that's a future-session feature.

**Demo limit**: The demo's references page just shows a notice directing to signup. The full references page is for live workspaces only.

**Awaiting-data signals**: The 9 signals tagged "Awaiting data" need data we don't have yet (customer detail, AR/AP aging, balance sheet, GL detail). They're shown so you know what's possible. Once you upload those file types, they'll auto-fire.
