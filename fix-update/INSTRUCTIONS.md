# Fix update - restore uploads, add isolated delete workspace

## What this does

1. **Replaces `src/app/actions.ts`** with a clean, autolinker-safe version
   (no template literals - the cause of the v6 corruption that broke uploads)
2. **Adds `/companies/[id]/delete`** as a brand-new isolated page with its own
   server action - completely separate from `actions.ts` so it cannot break
   the rest of the app if it has a problem
3. **Removes the broken DeleteWorkspaceForm and LogoUploadForm** files
4. **Patches the admin page** to link to the new delete page instead of
   the broken inline form, and to use a plain URL input for logos
5. **Cleans build cache** so the next deploy is fresh

## Steps - one command, then deploy

1. Download `fix-update.tar.gz` from this thread

2. In Codespace Explorer, right-click MA-PLATFORM, click Upload, select the file

3. In your terminal, paste this single line:

   ```
   tar -xzf fix-update.tar.gz && bash fix-update/APPLY.sh
   ```

4. The script will print step-by-step progress. The last 3 lines should all
   say `0` for verification. If any of them say something other than 0, stop
   and tell me what it printed.

5. Deploy:

   ```
   pnpm run deploy
   ```

6. After deploy finishes, hard-refresh your browser (Ctrl+Shift+R) and try:
   - Uploading one of the test P&L files - should work
   - Going to Admin -> scroll to Danger zone -> click "Delete this workspace"
   - This goes to the new isolated `/companies/[id]/delete` page
   - Type the workspace name to confirm, click delete
   - You will be redirected to your next workspace (or /companies/new)

## Why this will work

The bug that broke uploads was **not** in the upload code. The bug was in
`actions.ts` (which is imported by every page in the app). When that file
fails to load at the worker level, every route in the app starts returning
the generic worker error - including `/api/upload`. The error message was
misleading - it looked like an upload bug but it was actually a layout-level
module-load failure.

The new `actions.ts` uses **only string concatenation** instead of template
literals, so even if it gets pasted through a chat that autolinks URLs, it
cannot get corrupted into broken syntax.

The delete feature lives in its own page file with an inline server action.
If anything ever breaks in delete, only the delete page fails - uploads,
admin, and everything else keep working.
