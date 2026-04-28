import { RealReportsPage } from '@/components/pages/real-reports-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealReportsPage companyId={companyId} />;
}
