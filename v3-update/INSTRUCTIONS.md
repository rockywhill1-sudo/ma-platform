# V3 update — report descriptions, no em-dashes, printable/collapsible checklists, disclaimer page

## What this delivers

1. **"About this report" section** on every generated report (1-2 sentences explaining what the report is used for in M&A practice)
2. **All em-dashes (—) removed** from landing page, login, shell, and reports
3. **Print button on Checklists page** (top right)
4. **Collapsible workflow tables** in checklists - click header to collapse/expand each workflow
5. **Disclaimer page** at /disclaimer with your IP/ownership terms + "Back to site" button
6. **Footer links to disclaimer** on landing page and inside the app

## Step 1 - No SQL needed

This update is code only.

## Step 2 - Upload and extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `v3-update.tar.gz`.

In a terminal, paste this whole block:

```
tar -xzf v3-update.tar.gz && \
cp v3-update/landing-page.tsx src/app/page.tsx && \
cp v3-update/login-page.tsx src/app/login/page.tsx && \
cp v3-update/shell.tsx src/components/layout/shell.tsx && \
cp v3-update/report-view.tsx src/components/pages/report-view.tsx && \
cp v3-update/real-checklists-page.tsx src/components/pages/real-checklists-page.tsx && \
cp v3-update/checklists-toolbar.tsx src/components/pages/checklists-toolbar.tsx && \
cp v3-update/checklist-group.tsx src/components/pages/checklist-group.tsx && \
mkdir -p src/app/disclaimer && \
cp v3-update/disclaimer-page.tsx src/app/disclaimer/page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## Step 4 - Test

After deploy:

1. **Reports descriptions**: Generate any report. Scroll to bottom. Above the footer there's a new "About this report" section explaining what each report type is used for in M&A practice.

2. **No em-dashes**: View the landing page, login page, footer, and reports. All em-dashes replaced with regular commas/dashes.

3. **Checklists print**: Activate a checklist workflow. Click the "Print or Save as PDF" button top right. Everything prints cleanly with sidebar hidden, all tasks expanded automatically.

4. **Collapse checklists**: On the Checklists page, click any workflow header to collapse it. Click again to expand. There's "Expand all / Collapse all" controls at the top.

5. **Disclaimer page**: Click "Legal disclaimer & ownership" link in the footer (any page). You'll see the full disclaimer with your ownership statement, prohibited use list, and "Back to site" buttons (top right and bottom).

## Notes

The disclaimer text uses the exact language you provided plus added two short sections (No financial advice, No warranty) that are standard for SaaS legal pages. Edit `src/app/disclaimer/page.tsx` if you want to tweak the wording.

The "About this report" descriptions for each of the 11 report types are included in `src/components/pages/report-view.tsx` in the USAGE_NOTES constant. Edit the text there if you want to change descriptions.

Em-dashes were replaced with commas (the most natural substitute in 95% of cases). If you spot any place where the replacement reads awkwardly, tell me and I'll fix that line specifically.
