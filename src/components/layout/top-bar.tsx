'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ChevronDown, LogOut, User, Plus, Check } from 'lucide-react';
import { signOut } from '@/app/actions';
import type { CompanySummary } from '@/lib/types';

function initials(s: string) {
  return s.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('');
}

type Props = {
  currentCompany: CompanySummary;
  companies: CompanySummary[];
  userFullName: string;
  userEmail: string;
  demo?: boolean;
};

export function TopBar({ currentCompany, companies, userFullName, userEmail, demo = false }: Props) {
  const [userOpen, setUserOpen] = useState(false);
  const [wsOpen, setWsOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
      if (wsRef.current && !wsRef.current.contains(e.target as Node)) setWsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="border-b bg-background h-12 px-4 flex items-center justify-between print:hidden">
      <div className="relative" ref={wsRef}>
        <button
          onClick={() => !demo && setWsOpen(!wsOpen)}
          className="flex items-center gap-3 px-2 py-1 rounded-md hover:bg-muted transition-colors"
          disabled={demo}
        >
          <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground grid place-items-center text-[11px] font-semibold tabular-nums">
            {initials(currentCompany.name)}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-tight">{currentCompany.name}</p>
            {currentCompany.industry && (
              <p className="text-[10px] text-muted-foreground leading-tight font-mono uppercase tracking-wider">{currentCompany.industry}</p>
            )}
          </div>
          {!demo && <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>

        {wsOpen && !demo && (
          <div className="absolute left-0 top-full mt-1 w-72 rounded-md border bg-background shadow-md z-50 py-1">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b">
              Workspaces
            </div>
            <div className="max-h-64 overflow-y-auto">
              {companies.length === 0 ? (
                <p className="px-3 py-3 text-sm text-muted-foreground">No workspaces yet</p>
              ) : (
                companies.map((c) => {
                  const isCurrent = c.id === currentCompany.id;
                  return (
                    <Link
                      key={c.id}
                      href={`/companies/${c.id}/dashboard`}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-muted text-sm"
                      onClick={() => setWsOpen(false)}
                    >
                      <div className="h-6 w-6 rounded-md bg-primary text-primary-foreground grid place-items-center text-[10px] font-semibold tabular-nums shrink-0">
                        {initials(c.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        {c.industry && <p className="text-[10px] text-muted-foreground font-mono uppercase">{c.industry}</p>}
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </Link>
                  );
                })
              )}
            </div>
            <div className="border-t">
              <Link
                href="/companies/new"
                className="flex items-center gap-2 px-3 py-2 hover:bg-muted text-sm text-primary"
                onClick={() => setWsOpen(false)}
              >
                <Plus className="h-3.5 w-3.5" /> Create new workspace
              </Link>
            </div>
          </div>
        )}
      </div>

      {!demo && (
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-muted transition-colors"
          >
            <div className="h-7 w-7 rounded-full bg-muted grid place-items-center text-[11px] font-semibold">
              {initials(userFullName)}
            </div>
            <span className="text-sm font-medium">{userFullName}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          {userOpen && (
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
