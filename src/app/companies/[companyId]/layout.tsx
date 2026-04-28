import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/shell';
import { getCompanyById, getCompaniesForCurrentUser, getCurrentUser } from '@/lib/queries';
import { getAppSettings } from '@/lib/settings';

export default async function CompanyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const [company, companies, user, settings] = await Promise.all([
    getCompanyById(companyId),
    getCompaniesForCurrentUser(),
    getCurrentUser(),
    getAppSettings(),
  ]);
  if (!company || !user) notFound();

  return (
    <AppShell
      currentCompany={company}
      companies={companies}
      user={user}
      platformName={settings.platform_name}
      platformTagline={settings.platform_tagline}
      footerText={settings.footer_text}
      logoUrl={settings.logo_url || undefined}
    >
      {children}
    </AppShell>
  );
}
