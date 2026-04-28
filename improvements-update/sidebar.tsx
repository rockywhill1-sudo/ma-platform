'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, TrendingUp, Activity,
  Calculator, ListChecks, FileText, UploadCloud, Plug, Settings,
  ChevronsUpDown, LogOut, BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanySummary, AppUser } from '@/lib/types';
import { signOut } from '@/app/actions';

function initials(s: string) {
  return s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

type Props = {
  currentCompany: CompanySummary;
  companies: CompanySummary[];
  user: AppUser;
  demo?: boolean;
  platformName?: string;
};

export function Sidebar({ currentCompany, companies: _, user, demo = false, platformName = 'M&A Platform' }: Props) {
  const pathname = usePathname();
  const base = demo ? '/demo' : `/companies/${currentCompany.id}`;

  const sections: { label?: string; items: { href: string; icon: any; label: string; key: string }[] }[] = [
    { items: [{ href: `${base}/dashboard`, key: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }] },
    {
      label: 'Financial',
      items: [
        { href: `${base}/financials`, key: 'financials', icon: BarChart3, label: 'Financials' },
        { href: `${base}/analytics`, key: 'analytics', icon: TrendingUp, label: 'Analytics' },
        { href: `${base}/signals`, key: 'signals', icon: Activity, label: 'Signals' },
        { href: `${base}/valuation`, key: 'valuation', icon: Calculator, label: 'Valuation' },
      ],
    },
    {
      label: 'Deal',
      items: [
        { href: `${base}/checklists`, key: 'checklists', icon: ListChecks, label: 'Checklists' },
        { href: `${base}/reports`, key: 'reports', icon: FileText, label: 'Reports' },
      ],
    },
    {
      label: 'Workspace',
      items: [
        { href: `${base}/uploads`, key: 'uploads', icon: UploadCloud, label: 'Uploads' },
        { href: `${base}/integrations`, key: 'integrations', icon: Plug, label: 'Integrations' },
        { href: `${base}/admin`, key: 'admin', icon: Settings, label: 'Admin' },
      ],
    },
    {
      label: 'Resources',
      items: [
        { href: `${base}/references`, key: 'references', icon: BookOpen, label: 'M&A References' },
      ],
    },
  ];

  return (
    <aside className="w-60 border-r bg-background flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-3 border-b">
        <Link href="/" className="block px-2 py-1 mb-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-sm bg-primary shrink-0" />
            <span className="font-semibold tracking-tight text-sm truncate">{platformName}</span>
          </div>
        </Link>
        <button className="w-full flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-muted transition-colors group text-left">
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-semibold tabular-nums shrink-0">
            {initials(currentCompany.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate leading-tight">{currentCompany.name}</p>
            {currentCompany.industry && (
              <p className="text-[11px] text-muted-foreground truncate leading-tight">{currentCompany.industry}</p>
            )}
          </div>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {sections.map((section, i) => (
          <div key={i} className="space-y-1">
            {section.label && (
              <p className="px-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1.5">
                {section.label}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    'relative flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors',
                    active ? 'bg-muted text-foreground font-medium nav-active' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="p-3 border-t space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md">
          <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[11px] font-semibold">
            {initials(user.full_name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium truncate leading-tight">{user.full_name}</p>
            <p className="text-[11px] text-muted-foreground truncate leading-tight font-mono">{user.email}</p>
          </div>
        </div>
        {!demo && (
          <form action={signOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
            >
              <LogOut className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              <span>Sign out</span>
            </button>
          </form>
        )}
        {demo && (
          <div className="px-2 py-1.5 rounded-md bg-warning/10 border border-warning/20">
            <p className="text-[10px] font-mono uppercase tracking-widest text-warning mb-0.5">Demo</p>
            <p className="text-[11px] text-muted-foreground leading-tight">Read-only sample data</p>
          </div>
        )}
      </div>
    </aside>
  );
}
