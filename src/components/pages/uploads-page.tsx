'use client';

import { useState, useRef } from 'react';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { FilesByPlatform } from './files-by-platform';
import { UploadCloud, FileSpreadsheet, FileText, CheckCircle2, Circle, CircleDot, Loader } from 'lucide-react';
import { fmtBytes } from '@/lib/utils';
import type { Upload, UploadStatus } from '@/lib/types';

const STATUS_BADGE: Record<UploadStatus, { label: string; cls: string }> = {
  uploaded: { label: 'Uploaded', cls: 'text-info bg-info/10 border-info/20' },
  processing: { label: 'Processing', cls: 'text-info bg-info/10 border-info/20' },
  parsed: { label: 'Parsed', cls: 'text-success bg-success/10 border-success/20' },
  needs_input: { label: 'Confirm columns', cls: 'text-warning bg-warning/10 border-warning/20' },
  failed: { label: 'Failed', cls: 'text-destructive bg-destructive/10 border-destructive/20' },
  stored_only: { label: 'Stored only', cls: 'text-muted-foreground bg-muted' },
};

const KIND_LABELS: Record<string, string> = {
  general_ledger: 'General Ledger',
  trial_balance: 'Trial Balance',
  income_statement: 'Income Statement',
  balance_sheet: 'Balance Sheet',
  cash_flow: 'Cash Flow',
  chart_of_accounts: 'Chart of Accounts',
  customer_detail: 'Customer Detail',
  ar_aging: 'AR Aging Report',
  ap_aging: 'AP Aging Report',
  bank_statement: 'Bank Statement',
  tax_return: 'Tax Return',
  cim: 'CIM / Marketing Doc',
  contract: 'Contract',
  other: 'Other',
};

const CHECKLIST = [
  {
    section: 'Core financials',
    items: [
      { label: 'General Ledger detail, last 36 months', sub: 'CSV or XLSX, one row per JE line', kind: 'general_ledger' },
      { label: 'Trial Balance, monthly or quarterly', sub: 'CSV or XLSX', kind: 'trial_balance' },
      { label: 'P&L statements, last 3 fiscal years', sub: 'PDF or XLSX', kind: 'income_statement' },
      { label: 'Balance Sheets, last 3 fiscal years', sub: 'PDF or XLSX', kind: 'balance_sheet' },
      { label: 'Cash Flow statements', sub: 'PDF or XLSX, derived if missing', kind: 'cash_flow' },
      { label: 'Chart of Accounts', sub: 'CSV or XLSX', kind: 'chart_of_accounts' },
    ],
  },
  {
    section: 'Customer & revenue',
    items: [
      { label: 'Customer detail by month, last 24 months', sub: 'Revenue per customer per period', kind: 'customer_detail' },
      { label: 'AR Aging report, current month', sub: 'Confirm column mapping', kind: 'ar_aging' },
      { label: 'Top 20 customer contracts', sub: 'PDF, stored for legal diligence', kind: 'contract' },
    ],
  },
  {
    section: 'Cash & banking',
    items: [
      { label: 'Bank statements, last 12 months', sub: 'PDF, all operating accounts', kind: 'bank_statement' },
      { label: 'AP Aging, current month', sub: 'CSV or PDF', kind: 'ap_aging' },
    ],
  },
  {
    section: 'Tax & compliance',
    items: [
      { label: 'Federal tax returns, last 3 years', sub: 'PDF, used for owner-comp normalization', kind: 'tax_return' },
    ],
  },
  {
    section: 'Supporting documents',
    items: [
      { label: 'CIM or marketing materials', sub: 'Stored in data room', kind: 'cim' },
    ],
  },
];

export type UploadsPageProps = {
  companyId?: string;
  uploads: Pick<Upload, 'id' | 'file_name' | 'kind' | 'status' | 'file_size' | 'period_start' | 'period_end' | 'created_at'>[];
  /** When true, dropzone is decorative (demo). When false, posts to /api/upload. */
  readOnly?: boolean;
};

export function UploadsPage({ companyId, uploads, readOnly = false }: UploadsPageProps) {
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadedKinds = new Set(uploads.map((u) => u.kind));

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    if (readOnly) {
      alert(`Demo mode: ${files.length} file(s) selected. Sign up to actually upload and analyze.`);
      return;
    }
    if (!companyId) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append('file', file);
        fd.append('company_id', companyId);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) {
          const err = await res.text();
          alert(`Upload failed: ${err}`);
        }
      }
      window.location.reload();
    } finally {
      setBusy(false);
    }
  };

  const totalSize = uploads.reduce((sum, u) => sum + u.file_size, 0);
  const totalChecklist = CHECKLIST.reduce((sum, s) => sum + s.items.length, 0);

  return (
    <>
      <PageHeader
        title="Uploads"
        description="Drop financial documents, reports, and supporting files. The platform parses and analyzes each one automatically."
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
            className={`border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
          >
            <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 grid place-items-center text-primary mb-4">
              <UploadCloud className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <p className="text-base font-medium mb-1">{busy ? 'Uploading...' : 'Drop files here, or click to browse'}</p>
            <p className="text-sm text-muted-foreground mb-3">Up to 100 files at once. Each file up to 100 MB.</p>
            <p className="text-xs text-muted-foreground font-mono">PDF, XLSX, XLS, CSV, TSV, DOCX, JPG, PNG</p>
            <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
          </Card>

          <FilesByPlatform />

          <Card>
            <div className="px-5 py-3 border-b flex items-baseline justify-between">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Recent uploads</p>
              <p className="text-xs text-muted-foreground tabular-nums">{uploads.length} files, {fmtBytes(totalSize)}</p>
            </div>
            {uploads.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-muted-foreground">No files uploaded yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground bg-muted/30">
                  <tr className="text-left">
                    <th className="px-5 py-2 font-medium">File</th>
                    <th className="px-5 py-2 font-medium">Detected as</th>
                    <th className="px-5 py-2 font-medium">Period</th>
                    <th className="px-5 py-2 font-medium">Status</th>
                    <th className="px-5 py-2 font-medium text-right">Size</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {uploads.map((u) => {
                    const Icon = u.file_name.match(/\.(xlsx|xls|csv|tsv)$/i) ? FileSpreadsheet : FileText;
                    const badge = STATUS_BADGE[u.status];
                    return (
                      <tr key={u.id} className="row-hover">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="font-medium">{u.file_name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-muted-foreground">{KIND_LABELS[u.kind]}</td>
                        <td className="px-5 py-3 font-mono text-xs tabular-nums">
                          {u.period_start && u.period_end
                            ? `${u.period_start.slice(0, 7)} to ${u.period_end.slice(0, 7)}`
                            : '-'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono tabular-nums text-muted-foreground">{fmtBytes(u.file_size)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Checklist */}
        <aside className="space-y-4">
          <Card className="p-5 sticky top-24">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Upload checklist</p>
            <p className="text-xs text-muted-foreground mb-4">Recommended files to provide for full diligence analysis.</p>
            {CHECKLIST.map((sec) => (
              <div key={sec.section} className="mb-5">
                <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{sec.section}</p>
                <ul className="space-y-1.5 text-sm">
                  {sec.items.map((item) => {
                    const matching = uploads.find((u) => u.kind === item.kind);
                    let Icon = Circle;
                    let iconCls = 'text-muted-foreground';
                    if (matching?.status === 'parsed') { Icon = CheckCircle2; iconCls = 'text-success'; }
                    else if (matching?.status === 'needs_input') { Icon = CircleDot; iconCls = 'text-warning'; }
                    else if (matching?.status === 'processing' || matching?.status === 'uploaded') { Icon = Loader; iconCls = 'text-info'; }
                    return (
                      <li key={item.label} className="flex items-start gap-2">
                        <Icon className={`h-4 w-4 ${iconCls} mt-0.5 shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <p className="leading-snug">{item.label}</p>
                          <p className="text-[11px] text-muted-foreground">{item.sub}</p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
            <div className="mt-5 pt-4 border-t flex items-center justify-between">
              <p className="text-xs text-muted-foreground tabular-nums">{uploadedKinds.size} of {totalChecklist} uploaded</p>
              <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${(uploadedKinds.size / totalChecklist) * 100}%` }} />
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </>
  );
}
