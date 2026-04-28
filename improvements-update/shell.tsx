import { type ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { getAppSettings } from '@/lib/settings';
import type { CompanySummary, AppUser } from '@/lib/types';

export async function AppShell({
  currentCompany,
  companies,
  user,
  demo,
  children,
}: {
  currentCompany: CompanySummary;
  companies: CompanySummary[];
  user: AppUser;
  demo?: boolean;
  children: ReactNode;
}) {
  const settings = await getAppSettings();
  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar
        currentCompany={currentCompany}
        companies={companies}
        user={user}
        demo={demo}
        platformName={settings.platform_name}
      />
      <main className="flex-1 min-w-0 flex flex-col">
        <div className="flex-1 flex flex-col">{children}</div>
        <footer className="print:hidden border-t bg-background py-3 px-6">
          <p className="text-xs text-muted-foreground text-center">{settings.footer_text}</p>
        </footer>
      </main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  eyebrow,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  eyebrow?: string;
}) {
  return (
    <header className="border-b bg-background sticky top-0 z-10">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground mb-1">{eyebrow}</p>
          )}
          <h1 className="text-xl font-semibold tracking-tight truncate">{title}</h1>
          {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}

export function EmptyState({
  icon, eyebrow, title, description, primary, secondary,
}: {
  icon?: ReactNode;
  eyebrow?: string;
  title: string;
  description: string;
  primary?: { label: string; href?: string; disabled?: boolean; hint?: string };
  secondary?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      <div className="max-w-md space-y-6">
        {icon && (
          <div className="mx-auto h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          {eyebrow && (
            <p className="text-xs font-mono tracking-widest uppercase text-muted-foreground">{eyebrow}</p>
          )}
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        </div>
        {(primary || secondary) && (
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            {primary && primary.href && !primary.disabled ? (
              <a href={primary.href} className="inline-flex h-9 px-3 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                {primary.label}
              </a>
            ) : primary ? (
              <button disabled={primary.disabled} className="inline-flex h-9 px-3 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium disabled:opacity-50">
                {primary.label}
              </button>
            ) : null}
            {secondary && (
              <a href={secondary.href} className="inline-flex h-9 px-3 items-center justify-center rounded-md border bg-background text-sm font-medium hover:bg-muted">
                {secondary.label}
              </a>
            )}
          </div>
        )}
        {primary?.hint && <p className="text-xs text-muted-foreground font-mono">{primary.hint}</p>}
      </div>
    </div>
  );
}
