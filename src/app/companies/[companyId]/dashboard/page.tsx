import { RealDashboardPage } from '@/components/pages/real-dashboard-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealDashboardPage companyId={companyId} />;
}