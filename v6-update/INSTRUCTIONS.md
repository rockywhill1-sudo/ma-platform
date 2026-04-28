# V6 update — Delete workspace button

## What this delivers

1. **"Delete this workspace" button** in admin page (Danger zone)
2. **Type-to-confirm** safety check (must type the workspace name exactly)
3. **Cascade delete** - removes all uploads, P&L data, signals, reports, checklists, timeline, and team invites
4. **Auto-redirect** to next workspace, or /companies/new if no workspaces remain

## Step 1 - No SQL needed

Code only.

## Step 2 - Upload + extract

Right-click MA-PLATFORM in Codespace Explorer → Upload → select `v6-update.tar.gz`.

Terminal:

```
tar -xzf v6-update.tar.gz && \
cp v6-update/actions.ts src/app/actions.ts && \
cp v6-update/delete-workspace-form.tsx src/components/pages/delete-workspace-form.tsx && \
cp v6-update/real-admin-page.tsx src/components/pages/real-admin-page.tsx && \
echo "DONE"
```

## Step 3 - Deploy

```
source ~/.cf-token.sh
pnpm run deploy
```

## How to use

1. Go to **Admin** for the workspace you want to delete
2. Scroll to **Danger zone** at the bottom
3. Click **"Delete this workspace"**
4. Type the workspace name exactly (case-sensitive)
5. Click **"Delete workspace permanently"**
6. You will be redirected to your next remaining workspace, or to the create-new-workspace page if you deleted your last one

## Safety features

- Type-to-confirm prevents accidental clicks
- "Delete" button stays disabled until typed name matches exactly
- Database cascade delete is automatic - no orphan data
- If you delete the workspace you're currently in, you are safely redirected
