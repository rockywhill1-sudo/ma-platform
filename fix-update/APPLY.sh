#!/bin/bash
# Master fix script - single command to apply everything.
# Run this from /workspaces/ma-platform after extracting fix-update.tar.gz

set -e

echo "=== Step 1: Replace actions.ts with clean version ==="
cp fix-update/actions.ts src/app/actions.ts
echo "OK"

echo ""
echo "=== Step 2: Install isolated delete page ==="
mkdir -p "src/app/companies/[companyId]/delete"
cp fix-update/delete-page.tsx "src/app/companies/[companyId]/delete/page.tsx"
echo "OK"

echo ""
echo "=== Step 3: Remove broken component files ==="
rm -f src/components/pages/delete-workspace-form.tsx
rm -f src/components/pages/logo-upload-form.tsx
rm -rf src/app/api/upload-logo
echo "OK"

echo ""
echo "=== Step 4: Patch admin page to remove broken imports ==="
bash fix-update/patch-admin.sh

echo ""
echo "=== Step 5: Verify no broken references remain ==="
echo "References to DeleteWorkspaceForm in src/ (must be 0):"
grep -rn "DeleteWorkspaceForm" src/ 2>/dev/null | wc -l
echo "References to LogoUploadForm in src/ (must be 0):"
grep -rn "LogoUploadForm" src/ 2>/dev/null | wc -l
echo "References to uploadLogo in src/ (must be 0):"
grep -rn "uploadLogo" src/ 2>/dev/null | wc -l

echo ""
echo "=== Step 6: Clean build cache ==="
rm -rf .open-next .next
echo "OK"

echo ""
echo "=== READY TO DEPLOY ==="
echo "Run: pnpm run deploy"
