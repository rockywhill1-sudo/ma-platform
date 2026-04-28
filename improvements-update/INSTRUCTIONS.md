# Improvements update — sign-out fix, references page, presentation/export, editable platform settings, print CSS

This update bundles five things into one tarball:

1. **Sign-out fix** - explicitly clears Supabase cookies (was failing in production)
2. **References page** - new sidebar entry with M&A acronyms, formulas, deal stages
3. **Presentation Mode + Export** wired on dashboard - actually function now
4. **Editable platform settings** - admin page lets you change platform name, browser title, footer text
5. **Print CSS** - sidebar hidden when printing/saving as PDF, on every page

## Step 1 - Run SQL migration

In Supabase SQL Editor, paste contents of `05_app_settings.sql` and click Run.

This adds the `app_settings` table with seeded defaults for platform name, browser title, footer text, and admin user IDs.

## Step 2 - Upload and extract

Right-click `MA-PLATFORM` in Codespace Explorer, click Upload, select `improvements-update.tar.gz`.

In a terminal tab (NOT the dev server), paste this whole block:

```
tar -xzf improvements-update.tar.gz && \
cp improvements-update/settings.ts src/lib/settings.ts && \
cp improvements-update/actions.ts src/app/actions.ts && \
cp improvements-update/layout.tsx src/app/layout.tsx && \
cp improvements-update/globals.css src/app/globals.css && \
cp improvements-update/sidebar.tsx src/components/layout/sidebar.tsx && \
cp improvements-update/shell.tsx src/components/layout/shell.tsx && \
cp improvements-update/dashboard-actions.tsx src/components/pages/dashboard-actions.tsx && \
cp improvements-update/real-dashboard-page.tsx src/components/pages/real-dashboard-page.tsx && \
cp improvements-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
cp improvements-update/admin-route.tsx "src/app/companies/[companyId]/admin/page.tsx" && \
cp improvements-update/references-page.tsx src/components/pages/references-page.tsx && \
mkdir -p "src/app/companies/[companyId]/references" && \
cp improvements-update/references-route.tsx "src/app/companies/[companyId]/references/page.tsx" && \
echo "DONE"
```

You should see DONE printed.

## Step 3 - Test locally first (optional)

If your dev server is running, hard refresh `localhost:3000`. You should see:

- M&A References link in the sidebar under "Resources"
- Sign out button now works (redirects you to /login)
- Click Presentation Mode on dashboard - opens dark slideshow
- Click Export on dashboard - opens browser print dialog with sidebar hidden
- Visit Admin page - if you're the only user, you have admin rights and see the Platform Settings form
- Change Platform Name, save - sidebar logo text updates everywhere

## Step 4 - Deploy to production

```
pnpm run deploy
```

(If your CLOUDFLARE_API_TOKEN got cleared, run `source ~/.cf-token.sh` first.)

## What you can now do

### Change the platform name globally
Visit `mergers.neaigroup.com/companies/[your-id]/admin`. Scroll to "Platform settings". Change "Platform name" to anything you want (e.g., "NEAI Mergers" or "Acme Capital"). Save. Every page in the app, plus the sidebar logo, plus the browser tab title and bookmarks, now reflect your change.

### Change the footer
Same place. Edit "Footer text" and save. Appears at the bottom of every page (except print views).

### Lock down admin access
After your initial setup, copy your user ID from the "Signed in as" section of the admin page. Paste it into "Admin user IDs" and save. Now only you can edit platform settings. To add more admins later, comma-separate IDs.

### M&A References
Click "M&A References" in the sidebar. Includes 50+ acronyms (EBITDA, IOI, LOI, NRR, MOIC, etc), 15 standard formulas, and 11 typical deal stages.

### Print/PDF anything
Click any browser-print or Export button anywhere in the platform. The sidebar and chrome are hidden automatically. Pages are formatted for clean PDF output.

## Troubleshooting

**Sign out still doesn't work after deploy:**
Check that you actually deployed (not just edited locally). Run `pnpm run deploy` and look for "Deployed ma-platform triggers" in the output.

**Platform name doesn't update:**
Settings are cached briefly. Hard refresh (Ctrl+Shift+R) after saving.

**Admin form not visible:**
You need to be in the admin_user_ids list, OR the list must be empty (default). If you locked yourself out by adding only someone else's ID, run this in Supabase SQL Editor:
```sql
update app_settings set value = '' where key = 'admin_user_ids';
```
