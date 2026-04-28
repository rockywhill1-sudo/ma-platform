# Site content admin + uploads platform guide + demo navigation fix

## What this delivers

1. **Site Content admin** — edit all landing page text from admin (no deploys)
2. **Files-by-platform guide** on Uploads page (QBO, QB Desktop, Xero, Sage Intacct, NetSuite)
3. **Demo navigation fix** — clicking links inside the demo no longer bounces to login

## Step 1 - SQL migration

In Supabase SQL Editor, paste contents of `06_site_content.sql` and click Run.

This adds 9 new keys to your existing app_settings table for landing page content.

## Step 2 - Upload and extract

Right-click `MA-PLATFORM` in Codespace Explorer, click Upload, select `content-update.tar.gz`.

In a terminal, paste this whole block:

```
tar -xzf content-update.tar.gz && \
cp content-update/middleware.ts src/lib/supabase/middleware.ts && \
cp content-update/settings.ts src/lib/settings.ts && \
cp content-update/actions.ts src/app/actions.ts && \
cp content-update/landing-page.tsx src/app/page.tsx && \
cp content-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
cp content-update/files-by-platform.tsx src/components/pages/files-by-platform.tsx && \
cp content-update/uploads-page.tsx src/components/pages/uploads-page.tsx && \
mkdir -p "src/app/demo/[[...slug]]" && \
cp content-update/demo-catchall-route.tsx "src/app/demo/[[...slug]]/page.tsx" && \
echo "DONE"
```

If the demo catch-all path errors out because of an existing structure, instead do:

```
mkdir -p "src/app/demo/[...slug]" && \
cp content-update/demo-catchall-route.tsx "src/app/demo/[...slug]/page.tsx"
```

## Step 3 - Deploy

```
pnpm run deploy
```

(Make sure CLOUDFLARE_API_TOKEN is set: `source ~/.cf-token.sh` first.)

## Step 4 - Test

- Visit `mergers.neaigroup.com/admin` (or `/companies/[id]/admin`) and scroll to "Landing page content"
- Edit "Hero headline" to anything
- Click Save
- Open `mergers.neaigroup.com` in a new tab — your text appears immediately
- Visit Uploads page — see the new "What to download from your accounting system" section
- Click "Try the demo" from landing page, then click any link in the demo's sidebar — should stay in the demo, NOT bounce to login

## What you can edit from admin going forward

Without ever running `pnpm run deploy`:
- Platform name (sidebar logo, browser tab)
- Browser tab title
- Footer text (every page)
- Hero headline (line 1)
- Hero headline (line 2)
- Hero subheadline paragraph
- Demo button label
- Sign up button label
- Subtext under buttons ("No credit card required")
- Top nav links: Demo, Sign in, Sign up

For anything else (page layouts, new sections, structural changes), you'll still need a code change + deploy.
