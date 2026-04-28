import { RealFinancialsPage } from '@/components/pages/real-financials-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealFinancialsPage companyId={companyId} />;
}