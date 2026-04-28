import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';

const PL_ROWS = [
  ['Subscription revenue', [2612440, 2891200, 3124800, 3402000, 3790000], 13208000, false, false],
  ['Services revenue', [198000, 212400, 241800, 258640, 289600], 1000440, true, false],
  ['Total revenue', [2810440, 3103600, 3366600, 3660640, 4079600], 14208440, false, true],
  ['Cost of revenue', [-1587400, -1742200, -1891400, -2156800, -2348200], -8138600, false, false],
  ['Gross profit', [1223040, 1361400, 1475200, 1503840, 1731400], 6069840, false, true],
  ['Sales & Marketing', [-412800, -458400, -484200, -521800, -589400], -2053800, false, false],
  ['Research & Development', [-298200, -312600, -341800, -368400, -401200], -1424200, false, false],
  ['General & Administrative', [-186800, -195400, -208400, -224800, -241800], -870400, false, false],
  ['Adj. EBITDA', [325240, 395000, 440800, 388840, 499000], 3105672, false, true],
] as const;
const QUARTERS = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026'];

const fmt = (n: number) => {
  if (n < 0) return `(${Math.abs(n).toLocaleString()})`;
  return n.toLocaleString();
};

export function FinancialsPage() {
  return (
    <>
      <PageHeader
        title="Financials"
        description="P&L, Balance Sheet, Cash Flow, normalized from QuickBooks"
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-4 py-2.5 font-medium">Line item</th>
                {QUARTERS.map((q) => (
                  <th key={q} className="px-4 py-2.5 font-medium text-right tabular-nums">{q}</th>
                ))}
                <th className="px-4 py-2.5 font-medium text-right tabular-nums">TTM</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {PL_ROWS.map(([label, vals, ttm, indent, bold]) => (
                <tr key={label as string} className={`row-hover ${bold ? 'bg-muted/30' : ''}`}>
                  <td className={`px-4 py-2.5 ${indent ? 'pl-8 text-muted-foreground' : ''} ${bold ? 'font-semibold' : ''}`}>{label}</td>
                  {(vals as readonly number[]).map((v, i) => (
                    <td key={i} className={`px-4 py-2.5 text-right font-mono tabular-nums ${v < 0 ? 'text-muted-foreground' : ''} ${bold ? 'font-semibold' : ''}`}>
                      {fmt(v)}
                    </td>
                  ))}
                  <td className={`px-4 py-2.5 text-right font-mono tabular-nums ${bold ? 'font-bold text-primary' : ''}`}>{fmt(ttm as number)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </>
  );
}
