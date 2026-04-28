import { RealValuationPage } from '@/components/pages/real-valuation-server';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealValuationPage companyId={companyId} />;
}
