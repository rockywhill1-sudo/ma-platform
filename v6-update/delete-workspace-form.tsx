'use client';

import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { deleteWorkspace } from '@/app/actions';

export function DeleteWorkspaceForm({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const canDelete = confirmText === companyName;

  return (
    <>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 text-sm font-medium"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete this workspace
        </button>
      ) : (
        <div className="rounded-md border-2 border-destructive bg-destructive/5 p-5 space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-destructive">This action cannot be undone</p>
              <p className="text-sm text-muted-foreground mt-1">
                Deleting <span className="font-mono font-semibold">{companyName}</span> will permanently remove all of its uploaded files, parsed P&amp;L data, signals, reports, checklists, timeline, and team invites.
              </p>
            </div>
          </div>

          <form action={deleteWorkspace} className="space-y-3">
            <input type="hidden" name="company_id" value={companyId} />
            <div>
              <label className="text-sm font-medium block mb-1">
                Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{companyName}</span> to confirm:
              </label>
              <input
                type="text"
                name="confirm_name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono"
                placeholder={companyName}
                autoComplete="off"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setOpen(false); setConfirmText(''); }}
                className="px-4 py-2 rounded-md border bg-background text-sm font-medium hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!canDelete}
                className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete workspace permanently
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
