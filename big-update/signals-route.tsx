import { RealSignalsPage } from '@/components/pages/real-signals-page';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ companyId: string }>;
  searchParams: Promise<{ severity?: string }>;
}) {
  const { companyId } = await params;
  const { severity } = await searchParams;
  return <RealSignalsPage companyId={companyId} severityFilter={severity} />;
}
