import { UploadsPage } from '@/components/pages/uploads-page';
import { getUploads } from '@/lib/queries';

export default async function Page({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = await params;
  const uploads = await getUploads(companyId);
  return <UploadsPage companyId={companyId} uploads={uploads} />;
}
