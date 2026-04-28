# V2 update — fix profile save, file logo upload, workspace switcher, 7 new report types, fix email report

## What this delivers

1. **Profile name save now works** - handles both legacy `id` rows and new `user_id` rows
2. **Logo file upload** (not just URL paste) - uploads to your R2 bucket directly from your computer
3. **Workspace switcher** in top bar - dropdown to switch workspaces, "Create new workspace" link
4. **7 new report types** added: Customer Concentration, Working Capital Norm, EBITDA Bridge, Pro Forma Memo, IC Memo, Lender Package, Earnout Tracker
5. **Email report fix** - the action no longer breaks at the end

Total: 11 report types organized in 3 sections (Standard, Diligence deep-dives, Closing & post-close).

## Step 1 - SQL migration

Supabase SQL Editor → paste contents of `08_fixups.sql` → Run.

This:
- Fixes user_profiles legacy data (sets user_id = id where missing)
- Adds unique constraint on user_id
- Adds 7 new values to the report_kind enum

## Step 2 - Upload and extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `v2-update.tar.gz`.

In a terminal, paste this whole block:

```
tar -xzf v2-update.tar.gz && \
cp v2-update/actions.ts src/app/actions.ts && \
cp v2-update/shell.tsx src/components/layout/shell.tsx && \
cp v2-update/top-bar.tsx src/components/layout/top-bar.tsx && \
cp v2-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
cp v2-update/logo-upload-form.tsx src/components/pages/logo-upload-form.tsx && \
cp v2-update/real-reports-page.tsx src/components/pages/real-reports-page.tsx && \
cp v2-update/reports-actions.ts "src/app/companies/[companyId]/reports/actions.ts" && \
cp v2-update/report-view.tsx src/components/pages/report-view.tsx && \
cp v2-update/email-report-form.tsx src/components/pages/email-report-form.tsx && \
cp v2-update/print-button.tsx src/components/pages/print-button.tsx && \
mkdir -p src/app/api/upload-logo && \
cp v2-update/upload-logo-route.ts src/app/api/upload-logo/route.ts && \
echo "DONE"
```

## Step 3 - Configure R2 public access

Logo uploads need a public URL. In Cloudflare dashboard:

1. Go to R2 → click on your `ma-platform-uploads` bucket
2. Click **Settings** tab
3. Find **Public Development URL** → click **Allow access**

Cloudflare will show you a public URL that looks like `https://pub-xxxxx.r2.dev`. The actions.ts code already uses this format with your account ID.

## Step 4 - Deploy

```
source ~/.cf-token.sh
echo $CLOUDFLARE_API_TOKEN | head -c 10
pnpm run deploy
```

## Step 5 - Test

After deploy:

1. **Profile save**: Click your name top right → Edit profile → set First/Last name → Save. Should stick this time.
2. **Logo upload**: Admin → Platform branding → Choose file → pick PNG/JPG → uploads automatically → URL appears.
3. **Workspace switcher**: Click your workspace name in the top bar (top-left) → see the dropdown with all workspaces + "Create new workspace" link.
4. **New reports**: Reports page now shows 11 types in 3 sections.
5. **Email report**: Generate a report, click into it, click "Email report", send to yourself - should now redirect cleanly without "page couldn't load."

## Troubleshooting

**Logo upload says "Storage not configured":** R2 binding name might be different. Check `wrangler.jsonc` for the binding name. Default is `UPLOADS`, the upload-logo route uses that. If yours is named differently, edit `src/app/api/upload-logo/route.ts` line `const r2 = (env as any).UPLOADS;` to match.

**Profile still doesn't save:** Run this in SQL Editor:
```sql
select id, user_id, first_name, last_name, full_name 
from public.user_profiles 
where id = (select id from auth.users where email = 'rockywhill1@gmail.com');
```
If first_name/last_name show your changes, the save worked - the page just isn't showing them. Try logging out and back in.
