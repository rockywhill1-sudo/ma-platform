'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, BarChart3, TrendingUp, Activity,
  Calculator, ListChecks, FileText, UploadCloud, Plug, Settings, Calendar,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CompanySummary } from '@/lib/types';

type Props = {
  currentCompany: CompanySummary;
  demo?: boolean;
  platformName?: string;
  platformTagline?: string;
  logoUrl?: string;
};

export function Sidebar({ currentCompany, demo = false, platformName = 'M&A Platform', platformTagline = '', logoUrl }: Props) {
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
        { href: `${base}/timeline`, key: 'timeline', icon: Calendar, label: 'Timeline' },
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
    <aside className="w-48 border-r bg-background flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-3 border-b">
        <Link href="/" className="block px-1.5 py-1 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            {logoUrl ? (
              <Image src={logoUrl} alt={platformName} width={20} height={20} className="rounded-sm shrink-0 object-contain" />
            ) : (
              <div className="h-5 w-5 rounded-sm bg-primary shrink-0" />
            )}
            <span className="font-semibold tracking-tight text-sm truncate">{platformName}</span>
          </div>
          {platformTagline && (
            <p className="text-[10px] text-muted-foreground tracking-wide pl-7 mt-0.5">{platformTagline}</p>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-3.5">
        {sections.map((section, i) => (
          <div key={i} className="space-y-0.5">
            {section.label && (
              <p className="px-2 text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">
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
                    'relative flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    active ? 'bg-muted text-foreground font-medium nav-active' : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
                  <span className="truncate text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {demo && (
        <div className="p-3 border-t">
          <div className="px-2 py-1.5 rounded-md bg-warning/10 border border-warning/20">
            <p className="text-[10px] font-mono uppercase tracking-widest text-warning mb-0.5">Demo</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Read-only sample data</p>
          </div>
        </div>
      )}
    </aside>
  );
}
