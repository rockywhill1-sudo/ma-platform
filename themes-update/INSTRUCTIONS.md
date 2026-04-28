# Themes + tagline update

1. **Tagline below platform name** in sidebar (default "by NeuralEdge", editable)
2. **6 preset color themes** picker in admin: Slate Indigo, Forest, Burgundy, Midnight, Ocean, Bronze
3. Theme changes are instant, no redeploy needed (just save in admin)

## Step 1 - SQL

Supabase SQL Editor → paste contents of `09_themes.sql` → Run.

This adds two new keys: `platform_tagline` and `color_theme`.

## Step 2 - Upload + extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `themes-update.tar.gz`.

Terminal:

```
tar -xzf themes-update.tar.gz && \
cp themes-update/themes.ts src/lib/themes.ts && \
cp themes-update/settings.ts src/lib/settings.ts && \
cp themes-update/actions.ts src/app/actions.ts && \
cp themes-update/layout.tsx src/app/layout.tsx && \
cp themes-update/sidebar.tsx src/components/layout/sidebar.tsx && \
cp themes-update/shell.tsx src/components/layout/shell.tsx && \
cp themes-update/company-layout.tsx "src/app/companies/[companyId]/layout.tsx" && \
cp themes-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## Step 4 - Test

After deploy:

1. **Tagline appears in sidebar** under "M&A Platform", indented to align under the text (not the logo).

2. **Visit Admin → Platform branding** to:
   - Edit "Tagline" (defaults to "by NeuralEdge", change to anything)
   - Pick a "Color theme" from the dropdown
   - See 6 color swatches showing what each looks like
   - Save branding
   - Refresh the page → entire site recolors

## The 6 themes

| Theme | Best for |
|---|---|
| **Slate Indigo** | Default. Classic SaaS feel. |
| **Forest** | Wealth management, CPA firms, advisory |
| **Burgundy** | Traditional banking, law firms |
| **Midnight** | Modern fintech, tech buyouts |
| **Ocean** | Corporate banking, large institutions |
| **Bronze** | Hospitality, luxury, family offices |

## Adding more themes later

Open `src/lib/themes.ts`. Add a new entry to the `THEMES` object with your custom HSL values. Save, deploy. The new theme appears in the dropdown automatically.
