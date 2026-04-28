import { getPeriodSummaries, hasFinancialData } from '@/lib/queries';
import { RealValuationPageClient } from './real-valuation-page';

export async function RealValuationPage({ companyId }: { companyId: string }) {
  const hasData = await hasFinancialData(companyId);
  if (!hasData) {
    return <RealValuationPageClient ttmEbitda={0} ttmRevenue={0} hasData={false} />;
  }
  const summaries = await getPeriodSummaries(companyId);
  const recent = summaries.slice(-4);
  const ttmEbitda = recent.reduce((s, p) => s + Number(p.ebitda), 0);
  const ttmRevenue = recent.reduce((s, p) => s + Number(p.revenue), 0);
  return <RealValuationPageClient ttmEbitda={ttmEbitda} ttmRevenue={ttmRevenue} hasData={true} />;
}
