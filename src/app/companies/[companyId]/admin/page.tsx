import { RealAdminPage } from '@/components/pages/real-admin-page';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  return <RealAdminPage companyId={companyId} />;
}
