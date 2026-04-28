import { RealAnalyticsPage } from '@/components/pages/real-analytics-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealAnalyticsPage companyId={companyId} />;
}