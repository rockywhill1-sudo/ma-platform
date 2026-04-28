'use client';

import { useState } from 'react';
import { Mail, X } from 'lucide-react';
import { emailReport } from '@/app/actions';

export function EmailReportForm({ reportId, reportTitle }: { reportId: string; reportTitle: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm px-3 py-1.5 rounded-md border bg-background hover:bg-muted flex items-center gap-1.5"
      >
        <Mail className="h-3.5 w-3.5" /> Email report
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold tracking-tight">Email report</h3>
                <p className="text-xs text-muted-foreground">{reportTitle}</p>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form action={async (fd) => { await emailReport(fd); setOpen(false); }} className="p-6 space-y-4">
              <input type="hidden" name="report_id" value={reportId} />
              <div>
                <label className="text-sm font-medium block mb-1">Recipient email</label>
                <input type="email" name="recipient_email" required placeholder="recipient@example.com" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Recipient name (optional)</label>
                <input type="text" name="recipient_name" placeholder="Their name" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Personal note (optional)</label>
                <textarea name="note" rows={3} placeholder="Hi, sharing the latest report from our diligence work..." className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
              </div>
              <p className="text-xs text-muted-foreground">The recipient will get an email with a link to view this report online. They&apos;ll need to be able to view this report URL (currently public).</p>
              <div className="flex gap-2 justify-end pt-2">
                <button type="button" onClick={() => setOpen(false)} className="px-3 py-2 text-sm rounded-md hover:bg-muted">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90">Send email</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
