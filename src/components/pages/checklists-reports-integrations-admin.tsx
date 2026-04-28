import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { FileText, Presentation, Plus } from 'lucide-react';

export function ChecklistsPage() {
  return (
    <>
      <PageHeader title="Checklists" description="Quality of Earnings, 14 of 18 complete, due Apr 30" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 grid lg:grid-cols-4 gap-4">
        <Card className="p-3 h-fit">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2 px-2">Workflows</p>
          {[
            ['Quality of Earnings', '14/18', true],
            ['Legal & Corporate', '9/22', false],
            ['Commercial diligence', '6/15', false],
            ['Tech & security', '2/12', false],
            ['HR & benefits', '0/8', false],
            ['Tax & accounting', '3/9', false],
          ].map(([label, count, active]) => (
            <a key={label as string} href="#" className={`block px-2 py-1.5 rounded text-sm ${active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted'}`}>
              {label} <span className={`float-right text-xs font-mono ${active ? '' : 'text-muted-foreground'}`}>{count}</span>
            </a>
          ))}
        </Card>
        <Card className="lg:col-span-3 divide-y">
          {[
            { done: true, text: 'Verify revenue recognition policy alignment with ASC 606', sub: 'Rocky Hill, 2d ago, 3 attachments' },
            { done: true, text: 'Identify and quantify EBITDA addbacks (one-time, non-cash, owner-related)', sub: 'Rocky Hill, 4d ago, $312K identified' },
            { done: false, inProgress: true, text: 'Reconcile bookings to revenue (deferred + ratable)', sub: 'Assigned to Rocky, due Apr 28' },
            { done: false, text: 'Review top-20 customer contracts for cancellation/auto-renewal terms', sub: 'Unassigned, due Apr 30' },
            { done: false, text: 'Validate gross-to-net revenue adjustments', sub: 'Unassigned, due Apr 30' },
            { done: false, text: 'Confirm working capital normalization methodology', sub: 'Unassigned, due May 5' },
          ].map((item, i) => (
            <div key={i} className="p-4 flex items-start gap-3 hover:bg-muted/30">
              <input type="checkbox" defaultChecked={item.done} className="mt-1 accent-primary" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${item.done ? 'line-through text-muted-foreground' : 'font-medium'}`}>{item.text}</span>
                  {item.done && <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Done</span>}
                  {item.inProgress && <span className="text-[10px] font-mono uppercase tracking-widest text-warning bg-warning/10 px-1.5 py-0.5 rounded">In progress</span>}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

export function ReportsPage() {
  return (
    <>
      <PageHeader
        title="Reports"
        description="Investor-grade PDFs and presentation decks"
        actions={<button className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" /> Generate report</button>}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { type: 'QoE Report', title: 'Q4 2025 Quality of Earnings', meta: '22 pages, 4.2 MB, Mar 18', icon: FileText },
            { type: 'IOI Deck', title: 'Indication of Interest', meta: '9 slides, 1.8 MB, Mar 14', icon: Presentation },
            { type: 'Diligence Summary', title: 'Pre-LOI Diligence', meta: '14 pages, 3.1 MB, Mar 8', icon: FileText },
          ].map((r) => {
            const Icon = r.icon;
            return (
              <Card key={r.title} className="overflow-hidden hover:shadow-sm transition-shadow">
                <div className="aspect-[4/3] bg-muted/50 grid place-items-center border-b">
                  <Icon className="h-10 w-10 text-muted-foreground" />
                </div>
                <div className="p-4">
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{r.type}</p>
                  <h3 className="font-semibold mb-1 truncate">{r.title}</h3>
                  <p className="text-xs text-muted-foreground">{r.meta}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function IntegrationsPage() {
  return (
    <>
      <PageHeader title="Integrations" description="Connect accounting systems and data sources" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        <div className="space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Connected</p>
          <Card className="p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-md bg-success/10 grid place-items-center text-success font-mono text-xs font-semibold tracking-widest shrink-0">QB</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">QuickBooks Online</h3>
                <span className="text-[10px] font-mono uppercase tracking-widest text-success bg-success/10 px-1.5 py-0.5 rounded border border-success/20">Active</span>
              </div>
              <p className="text-xs text-muted-foreground">Last sync 2h ago, 1,847 GL entries, 23 customers, 47 vendors</p>
            </div>
            <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted">Sync now</button>
          </Card>
        </div>
        <div className="space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Available</p>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              ['XE', 'Xero', 'OAuth connection, pulls chart of accounts, GL, contacts.'],
              ['SI', 'Sage Intacct', 'API credentials, pulls normalized accounting data.'],
              ['NS', 'NetSuite', 'SuiteCloud OAuth, pulls accounting and operational data.'],
              ['CSV', 'CSV upload', 'Upload trial balance, GL export, or normalized P&L/BS.'],
            ].map(([code, name, desc]) => (
              <Card key={code} className="p-5 flex items-start gap-4">
                <div className="h-10 w-10 rounded-md bg-muted grid place-items-center font-mono text-xs font-semibold tracking-widest shrink-0">{code}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm mb-1">{name}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
                </div>
                <button className="text-sm px-3 py-1.5 rounded-md border hover:bg-muted shrink-0">Connect</button>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export function AdminPage({ companyName, userName, userEmail }: { companyName: string; userName: string; userEmail: string }) {
  return (
    <>
      <PageHeader title="Admin" description="Workspace settings, members, and billing" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">
        <section className="space-y-3">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Workspace</p>
          <Card className="p-6">
            <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
              <div><dt className="text-xs text-muted-foreground mb-1">Name</dt><dd className="font-medium">{companyName}</dd></div>
              <div><dt className="text-xs text-muted-foreground mb-1">Industry</dt><dd className="font-medium">Software & AI</dd></div>
              <div><dt className="text-xs text-muted-foreground mb-1">Currency</dt><dd className="font-mono tabular-nums">USD</dd></div>
              <div><dt className="text-xs text-muted-foreground mb-1">Fiscal year end</dt><dd className="font-medium">December</dd></div>
            </dl>
          </Card>
        </section>
        <section className="space-y-3">
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">Members</p>
            <p className="text-xs text-muted-foreground">1 total</p>
          </div>
          <Card className="divide-y">
            <div className="px-5 py-4 flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-semibold">
                {userName.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground font-mono">{userEmail}</p>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground px-2 py-1 rounded bg-muted">owner</span>
            </div>
          </Card>
        </section>
      </div>
    </>
  );
}
