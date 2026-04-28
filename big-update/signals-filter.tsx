'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export function SignalsFilter({ counts, active }: { counts: { high: number; med: number; low: number; positive: number; awaiting: number }; active: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const setFilter = (sev: string) => {
    const params = new URLSearchParams(sp.toString());
    if (sev === 'all') {
      params.delete('severity');
    } else {
      params.set('severity', sev);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const filters = [
    { key: 'all', label: 'All', count: counts.high + counts.med + counts.low + counts.positive + counts.awaiting, color: 'bg-foreground text-background' },
    { key: 'high', label: 'High', count: counts.high, color: 'bg-destructive text-destructive-foreground' },
    { key: 'med', label: 'Medium', count: counts.med, color: 'bg-warning text-warning-foreground' },
    { key: 'low', label: 'Low', count: counts.low, color: 'bg-info text-info-foreground' },
    { key: 'positive', label: 'Positive', count: counts.positive, color: 'bg-success text-success-foreground' },
    { key: 'awaiting', label: 'Awaiting data', count: counts.awaiting, color: 'bg-muted text-muted-foreground' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((f) => {
        const isActive = active === f.key || (active === 'all' && f.key === 'all');
        return (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isActive ? f.color : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}
          >
            {f.label} <span className="font-mono tabular-nums opacity-75">· {f.count}</span>
          </button>
        );
      })}
    </div>
  );
}
