'use client';

import { useState, useEffect, useRef } from 'react';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { signOut } from '@/app/actions';
import type { CompanySummary } from '@/lib/types';

function initials(s: string) {
  return s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

type Props = {
  currentCompany: CompanySummary;
  userFullName: string;
  userEmail: string;
  demo?: boolean;
};

export function TopBar({ currentCompany, userFullName, userEmail, demo = false }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="border-b bg-background h-12 px-4 flex items-center justify-between print:hidden">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-semibold tabular-nums">
          {initials(currentCompany.name)}
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">{currentCompany.name}</p>
          {currentCompany.industry && (
            <p className="text-[10px] text-muted-foreground leading-tight font-mono uppercase tracking-wider">{currentCompany.industry}</p>
          )}
        </div>
      </div>

      {!demo && (
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[11px] font-semibold">
              {initials(userFullName)}
            </div>
            <span className="text-sm font-medium">{userFullName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-1 w-56 rounded-md border bg-background shadow-md z-50 py-1">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-medium">{userFullName}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">{userEmail}</p>
              </div>
              <a href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted">
                <User className="h-3.5 w-3.5" /> Edit profile
              </a>
              <form action={signOut}>
                <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted text-left">
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
