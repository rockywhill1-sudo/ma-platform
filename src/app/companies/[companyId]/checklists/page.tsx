import { RealChecklistsPage } from '@/components/pages/real-checklists-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealChecklistsPage companyId={companyId} />;
}
