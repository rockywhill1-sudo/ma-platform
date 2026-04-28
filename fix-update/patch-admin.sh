#!/bin/bash
# Surgically fix real-admin-page.tsx without rewriting the whole file.
# This avoids corruption from copy-paste of large code blocks.

set -e

ADMIN_FILE="src/components/pages/real-admin-page.tsx"

if [ ! -f "$ADMIN_FILE" ]; then
  echo "ERROR: $ADMIN_FILE not found"
  exit 1
fi

# 1. Remove the import lines for the broken/deleted form
sed -i "/import { DeleteWorkspaceForm } from '\.\/delete-workspace-form';/d" "$ADMIN_FILE"
sed -i "/import { LogoUploadForm } from '\.\/logo-upload-form';/d" "$ADMIN_FILE"

# 2. Replace the LogoUploadForm usage with a plain URL input
sed -i 's|<LogoUploadForm currentUrl={settings.logo_url} />|<input type="url" name="logo_url" defaultValue={settings.logo_url} placeholder="https://example.com/logo.png" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />|g' "$ADMIN_FILE"

# 3. Replace the DeleteWorkspaceForm usage with a Link to the new isolated delete page
sed -i 's|<DeleteWorkspaceForm companyId={companyId} companyName={company.name} />|<a href={"/companies/" + companyId + "/delete"} className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 text-sm font-medium">Delete this workspace</a>|g' "$ADMIN_FILE"

echo "DONE patching $ADMIN_FILE"
echo ""
echo "Verification:"
echo "Lines mentioning DeleteWorkspaceForm or LogoUploadForm (should be 0):"
grep -c "DeleteWorkspaceForm\|LogoUploadForm" "$ADMIN_FILE" || echo "0"
