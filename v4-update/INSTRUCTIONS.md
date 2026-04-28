# V4 update — themes actually apply, smaller report icons, distinct headers, vertical deal stages, vibrant default

## What this delivers

1. **Theme picker actually changes the site** - root layout now forces dynamic rendering, theme overrides apply across primary, accent, success, warning, info, destructive, and border radius
2. **New default Vibrant theme** - bright indigo + violet, gradients, rounded edges, more energy
3. **Classic theme** added as a preset that restores the previous slate look
4. **Generated reports tile icons** much smaller - compact 4x grid, file icon as a small badge instead of huge centered image
5. **Distinct section headers** - "Generate a new report" with sparkle gradient icon, "Generated reports" with folder icon, divider lines, count badge
6. **Deal stages stacked vertically** - numbered timeline with circular badges 1, 2, 3, 4... down

## Step 1 - No SQL needed

Code only.

## Step 2 - Upload + extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `v4-update.tar.gz`.

Terminal:

```
tar -xzf v4-update.tar.gz && \
cp v4-update/themes.ts src/lib/themes.ts && \
cp v4-update/layout.tsx src/app/layout.tsx && \
cp v4-update/globals.css src/app/globals.css && \
cp v4-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
cp v4-update/real-reports-page.tsx src/components/pages/real-reports-page.tsx && \
cp v4-update/references-page.tsx src/components/pages/references-page.tsx && \
echo "DONE"
```

## Step 3 - Make Vibrant the new default (one SQL)

In Supabase SQL Editor:

```sql
update public.app_settings set value = 'vibrant' where key = 'color_theme';
```

(This switches your current default 'default' or 'slate-indigo' name to 'vibrant'. The Classic theme remains available in the dropdown.)

## Step 4 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## Step 5 - Test

1. Right after deploy, **hard refresh** (Ctrl+Shift+R) the site. You'll see the Vibrant theme applied: indigo/violet primary color, more rounded corners.

2. Visit **Admin → Platform branding → Color theme dropdown**. You'll see 7 themes:
   - **Vibrant** (new default - indigo/violet with gradients)
   - **Classic** (the previous slate look you had)
   - **Forest, Burgundy, Midnight, Ocean, Bronze**

   Swatches preview each theme below the dropdown.

3. Pick a different theme → Save branding → hard refresh. Site recolors.

4. Pick **Classic** to return to the previous slate look.

5. Visit **Reports** page:
   - "Generate a new report" header has a gradient sparkle icon
   - "Generated reports" header has a folder icon and count badge
   - Generated report tiles are compact (small icon, no big image)
   - 4 columns on wide screens

6. Visit **M&A References** → scroll to "Typical deal stages":
   - Numbered circles 1-11 stacked vertically
   - Vertical line connecting them as a timeline

## Notes

The theme system uses CSS custom properties injected at the layout level. When you save a theme in admin, the next page load picks up the new theme. Hard refresh forces a full reload so cached CSS doesn't override the change.

If a theme looks wrong (e.g., contrast issues), pick a different one or tell me and I'll tune the values.
