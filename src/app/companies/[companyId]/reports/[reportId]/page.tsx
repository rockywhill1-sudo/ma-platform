import { ReportView } from '@/components/pages/report-view';

export default async function Page({ params }: { params: Promise<{ companyId: string; reportId: string }> }) {
  const { companyId, reportId } = await params;
  return <ReportView companyId={companyId} reportId={reportId} />;
}
