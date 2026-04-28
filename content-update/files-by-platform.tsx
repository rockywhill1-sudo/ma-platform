import { Card } from '@/components/ui/primitives';

const PLATFORMS = [
  {
    name: 'QuickBooks Online',
    essential: 'Profit and Loss',
    path: 'Reports → Profit and Loss → "Display columns by" → Quarters → "Compare another period" YoY → Export Excel',
    others: [
      { file: 'Balance Sheet', path: 'Reports → Balance Sheet → Quarters' },
      { file: 'A/R Aging Summary', path: 'Reports → A/R Aging Summary' },
      { file: 'A/P Aging Summary', path: 'Reports → A/P Aging Summary' },
      { file: 'Sales by Customer Summary', path: 'Reports → Sales by Customer Summary → 12-24 months' },
      { file: 'General Ledger', path: 'Reports → General Ledger → trailing 24 months (large file)' },
    ],
  },
  {
    name: 'QuickBooks Desktop',
    essential: 'Profit & Loss Standard',
    path: 'Reports → Company & Financial → Profit & Loss Standard → Customize Report → Display tab → "Columns" set to Quarter',
    others: [
      { file: 'Balance Sheet Standard', path: 'Reports → Company & Financial → Balance Sheet Standard' },
      { file: 'Sales by Customer Summary', path: 'Reports → Sales → Sales by Customer Summary' },
      { file: 'A/R Aging Summary', path: 'Reports → Customers & Receivables → A/R Aging Summary' },
      { file: 'General Ledger', path: 'Reports → Accountant & Taxes → General Ledger' },
    ],
  },
  {
    name: 'Xero',
    essential: 'Profit and Loss',
    path: 'Reports → Profit and Loss → Compare Periods toggle ON → 8 quarters → Export Excel',
    others: [
      { file: 'Balance Sheet', path: 'Reports → Balance Sheet → Compare Periods → 8 quarters' },
      { file: 'Aged Receivables Summary', path: 'Reports → Aged Receivables Summary' },
      { file: 'Aged Payables Summary', path: 'Reports → Aged Payables Summary' },
      { file: 'Account Transactions', path: 'Reports → Account Transactions → date range' },
    ],
  },
  {
    name: 'Sage Intacct',
    essential: 'Income Statement by Period',
    path: 'Reports → Financial → Income Statement → Period comparison → 8 quarters',
    others: [
      { file: 'Balance Sheet', path: 'Reports → Financial → Balance Sheet' },
      { file: 'Trial Balance', path: 'Reports → Financial → Trial Balance' },
      { file: 'AR Aging Detail', path: 'Reports → Order Entry → AR Aging Detail' },
      { file: 'AP Aging Detail', path: 'Reports → Purchasing → AP Aging Detail' },
    ],
  },
  {
    name: 'NetSuite',
    essential: 'Income Statement',
    path: 'Reports → Financial → Income Statement → enable Period Comparison → 8 quarters',
    others: [
      { file: 'Balance Sheet', path: 'Reports → Financial → Balance Sheet' },
      { file: 'A/R Register', path: 'Reports → Financial → A/R Register' },
      { file: 'A/P Register', path: 'Reports → Financial → A/P Register' },
      { file: 'Customer Sales Detail', path: 'Reports → Sales → Customer Sales Detail' },
    ],
  },
];

export function FilesByPlatform() {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">What to download from your accounting system</p>
        <p className="text-sm text-muted-foreground">For maximum value from this platform, the priority is: <strong>P&amp;L by quarter (8+ quarters) &gt; Customer sales detail &gt; Balance Sheet &gt; AR/AP aging</strong>. Click your platform to see exactly what to export.</p>
      </div>
      <div className="space-y-4">
        {PLATFORMS.map((p) => (
          <details key={p.name} className="border rounded-md">
            <summary className="px-4 py-3 cursor-pointer hover:bg-muted/30 font-medium text-sm flex items-center justify-between">
              <span>{p.name}</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Click to expand</span>
            </summary>
            <div className="px-4 pb-4 space-y-3 border-t">
              <div className="pt-3">
                <p className="text-[10px] font-mono uppercase tracking-widest text-success mb-1">Essential</p>
                <p className="text-sm font-medium">{p.essential}</p>
                <p className="text-xs text-muted-foreground mt-1">{p.path}</p>
              </div>
              {p.others.length > 0 && (
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Recommended additional files</p>
                  <div className="space-y-2">
                    {p.others.map((o, i) => (
                      <div key={i}>
                        <p className="text-sm font-medium">{o.file}</p>
                        <p className="text-xs text-muted-foreground">{o.path}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
      <p className="text-xs text-muted-foreground mt-4 leading-snug">
        <strong>Tip:</strong> A multi-period P&amp;L (8+ quarters in columns) gives you the trend analysis, signals, and TTM math automatically. Without comparison columns, the dashboard will only show a single point in time.
      </p>
    </Card>
  );
}
