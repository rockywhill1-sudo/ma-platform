'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { Search } from 'lucide-react';

const ACRONYMS = [
  { term: 'EBITDA', def: 'Earnings before interest, taxes, depreciation, and amortization. Standard proxy for operating cash flow.', cat: 'Financial' },
  { term: 'TTM', def: 'Trailing twelve months. Sum of the most recent 4 quarters of financial data.', cat: 'Financial' },
  { term: 'LTM', def: 'Last twelve months. Same as TTM.', cat: 'Financial' },
  { term: 'COGS', def: 'Cost of goods sold. Direct costs of producing the goods or services sold.', cat: 'Financial' },
  { term: 'OpEx', def: 'Operating expenses. SG&A, R&D, sales, marketing, etc.', cat: 'Financial' },
  { term: 'SG&A', def: 'Selling, general, and administrative expenses.', cat: 'Financial' },
  { term: 'CapEx', def: 'Capital expenditures. Money spent on long-term physical or intangible assets.', cat: 'Financial' },
  { term: 'FCF', def: 'Free cash flow. Operating cash flow minus capex. The cash actually available to investors.', cat: 'Financial' },
  { term: 'NWC', def: 'Net working capital. Current assets minus current liabilities, excluding cash and debt.', cat: 'Financial' },
  { term: 'DSO', def: 'Days sales outstanding. Average days to collect AR after a sale.', cat: 'Financial' },
  { term: 'DPO', def: 'Days payable outstanding. Average days to pay vendors.', cat: 'Financial' },
  { term: 'DIO', def: 'Days inventory outstanding. Average days inventory is held before sale.', cat: 'Financial' },
  { term: 'CCC', def: 'Cash conversion cycle. DSO + DIO − DPO. Lower is better.', cat: 'Financial' },
  { term: 'QoE', def: 'Quality of Earnings. A diligence study that normalizes EBITDA, validates revenue recognition, and identifies addbacks.', cat: 'Diligence' },
  { term: 'IOI', def: 'Indication of interest. Non-binding letter expressing initial purchase interest with rough valuation range.', cat: 'Deal' },
  { term: 'LOI', def: 'Letter of intent. Non-binding offer with specific terms used to enter exclusivity.', cat: 'Deal' },
  { term: 'NDA', def: 'Non-disclosure agreement. Confidentiality contract executed before sharing sensitive information.', cat: 'Deal' },
  { term: 'CIM', def: 'Confidential information memorandum. Detailed marketing document prepared for sale process.', cat: 'Deal' },
  { term: 'MNPI', def: 'Material non-public information. Subject to insider trading rules.', cat: 'Deal' },
  { term: 'SPA', def: 'Stock purchase agreement. Definitive document for acquiring stock of a target.', cat: 'Deal' },
  { term: 'APA', def: 'Asset purchase agreement. Definitive document for acquiring specific assets, not the whole entity.', cat: 'Deal' },
  { term: 'R&W', def: 'Representations and warranties. Statements made by the seller in the SPA that, if untrue, expose them to liability.', cat: 'Deal' },
  { term: 'RWI', def: 'Representations and warranties insurance. Policy that covers buyer for breaches of seller R&W.', cat: 'Deal' },
  { term: 'Earnout', def: 'Contingent payment to seller based on post-close performance.', cat: 'Deal' },
  { term: 'Holdback', def: 'Portion of purchase price withheld at close for a defined period as protection against breaches.', cat: 'Deal' },
  { term: 'Escrow', def: 'Funds held by a third party as security for indemnification claims.', cat: 'Deal' },
  { term: 'Indemnification', def: 'Seller obligation to compensate buyer for losses from breaches of reps and warranties.', cat: 'Deal' },
  { term: 'CAC', def: 'Customer acquisition cost. Sales and marketing dollars spent to acquire one new customer.', cat: 'Operational' },
  { term: 'LTV', def: 'Lifetime value. Total gross profit a customer generates over their relationship with the business.', cat: 'Operational' },
  { term: 'NRR', def: 'Net revenue retention. Revenue from existing customers this period vs same group prior period, including upsells and churn. >100% is healthy.', cat: 'Operational' },
  { term: 'GRR', def: 'Gross revenue retention. Same as NRR but excludes upsells. Measures pure churn.', cat: 'Operational' },
  { term: 'ARR', def: 'Annual recurring revenue. Annualized subscription revenue.', cat: 'Operational' },
  { term: 'MRR', def: 'Monthly recurring revenue.', cat: 'Operational' },
  { term: 'ACV', def: 'Annual contract value. Average annualized value of customer contracts.', cat: 'Operational' },
  { term: 'TCV', def: 'Total contract value. Total dollar value of a customer contract over its full term.', cat: 'Operational' },
  { term: 'IRR', def: 'Internal rate of return. The discount rate at which NPV equals zero. The annualized return on an investment.', cat: 'Valuation' },
  { term: 'MOIC', def: 'Multiple on invested capital. Total cash returned divided by cash invested. Aka "money multiple."', cat: 'Valuation' },
  { term: 'NPV', def: 'Net present value. Future cash flows discounted to today.', cat: 'Valuation' },
  { term: 'WACC', def: 'Weighted average cost of capital. Blended cost of debt and equity used to discount cash flows.', cat: 'Valuation' },
  { term: 'EV', def: 'Enterprise value. Equity value + debt − cash. The total acquisition price.', cat: 'Valuation' },
  { term: 'EV/EBITDA', def: 'Enterprise value to EBITDA. Standard multiple for valuing private companies.', cat: 'Valuation' },
  { term: 'Bolt-on', def: 'Acquisition added to an existing platform company in PE.', cat: 'Strategy' },
  { term: 'Platform', def: 'Initial PE acquisition that becomes the base for subsequent bolt-ons.', cat: 'Strategy' },
  { term: 'Roll-up', def: 'Strategy of acquiring multiple small companies in the same industry and consolidating them.', cat: 'Strategy' },
  { term: 'Synergies', def: 'Cost savings or revenue gains from combining two companies. Buy-side often models them; sell-side rarely should.', cat: 'Strategy' },
  { term: 'Pro forma', def: '"As if." Financials adjusted to reflect a hypothetical transaction or normalization.', cat: 'Diligence' },
  { term: 'Concentration', def: 'Revenue dependence on a small number of customers. Top customer >10% is a flag.', cat: 'Diligence' },
  { term: 'Closing', def: 'The date the transaction legally consummates and ownership transfers.', cat: 'Deal' },
  { term: 'Pre-close', def: 'Period between LOI and closing during which final diligence and document drafting occur.', cat: 'Deal' },
  { term: 'Post-close', def: 'Period after closing covering integration, true-ups, and earnout measurement.', cat: 'Deal' },
];

const FORMULAS = [
  { name: 'Gross profit', formula: 'Revenue − COGS' },
  { name: 'Gross margin %', formula: '(Gross profit ÷ Revenue) × 100' },
  { name: 'EBITDA', formula: 'Operating income + Depreciation + Amortization' },
  { name: 'EBITDA margin %', formula: '(EBITDA ÷ Revenue) × 100' },
  { name: 'Free cash flow', formula: 'Operating cash flow − Capital expenditures' },
  { name: 'Working capital', formula: 'Current assets − Current liabilities' },
  { name: 'Net debt', formula: 'Total debt − Cash and equivalents' },
  { name: 'Enterprise value', formula: 'Market cap + Net debt + Preferred + Minority interest' },
  { name: 'EV/EBITDA multiple', formula: 'Enterprise value ÷ TTM EBITDA' },
  { name: 'IRR', formula: 'Discount rate at which NPV(cash flows) = 0' },
  { name: 'MOIC', formula: 'Total proceeds ÷ Total invested' },
  { name: 'Customer LTV (simplified)', formula: '(ARPU × Gross margin %) ÷ Churn rate' },
  { name: 'CAC payback (months)', formula: 'CAC ÷ (Monthly ARR × Gross margin %)' },
  { name: 'Net revenue retention', formula: '((Starting MRR + Expansion − Churn) ÷ Starting MRR) × 100' },
];

const DEAL_STAGES = [
  { stage: '1. Sourcing', desc: 'Identifying potential acquisition targets through network, broker introductions, or proprietary outreach.' },
  { stage: '2. Initial review', desc: 'Sign NDA, receive teaser/CIM, do high-level financial review and strategic fit assessment.' },
  { stage: '3. IOI', desc: 'Submit indication of interest with valuation range and proposed structure. Non-binding.' },
  { stage: '4. Management meetings', desc: 'In-person or virtual meetings with leadership.' },
  { stage: '5. LOI', desc: 'Letter of intent with specific price and key terms. Usually establishes exclusivity period.' },
  { stage: '6. Diligence', desc: 'Financial QoE, legal, commercial, tech, HR review.' },
  { stage: '7. Definitive docs', desc: 'Drafting and negotiating SPA/APA, disclosure schedules.' },
  { stage: '8. Sign and announce', desc: 'Execute definitive agreement.' },
  { stage: '9. Pre-close', desc: 'Regulatory approvals, third-party consents, financing.' },
  { stage: '10. Close', desc: 'Funds wire, ownership transfers.' },
  { stage: '11. Post-close', desc: 'Working capital true-up, earnout measurement, integration.' },
];

const CATS = ['Financial', 'Diligence', 'Deal', 'Operational', 'Valuation', 'Strategy'];

export function ReferencesPage() {
  const [q, setQ] = useState('');

  const filteredAcronyms = useMemo(() => {
    if (!q.trim()) return ACRONYMS;
    const lower = q.toLowerCase();
    return ACRONYMS.filter((a) => a.term.toLowerCase().includes(lower) || a.def.toLowerCase().includes(lower));
  }, [q]);

  const filteredFormulas = useMemo(() => {
    if (!q.trim()) return FORMULAS;
    const lower = q.toLowerCase();
    return FORMULAS.filter((f) => f.name.toLowerCase().includes(lower) || f.formula.toLowerCase().includes(lower));
  }, [q]);

  return (
    <>
      <PageHeader title="M&A References" description="Acronyms, formulas, and deal stage reference" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        {/* Search + jump nav */}
        <div className="flex items-center gap-3 sticky top-[57px] bg-muted/30 backdrop-blur py-3 z-10">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search acronyms, formulas..."
              className="w-full pl-9 pr-3 py-2 rounded-md border bg-background text-sm"
            />
          </div>
          <a href="#acronyms" className="text-xs text-muted-foreground hover:text-foreground">Acronyms</a>
          <a href="#formulas" className="text-xs text-muted-foreground hover:text-foreground">Formulas</a>
          <a href="#stages" className="text-xs text-muted-foreground hover:text-foreground">Deal stages</a>
        </div>

        {/* Acronyms by category - 3 columns */}
        <Card className="p-6" id="acronyms">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Acronyms &amp; terms</p>

          {q.trim() ? (
            <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8 space-y-3">
              {filteredAcronyms.map((a) => (
                <div key={a.term} className="break-inside-avoid border-l-2 border-muted pl-3 mb-3">
                  <div className="flex items-baseline gap-2">
                    <p className="font-mono text-sm font-semibold">{a.term}</p>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{a.cat}</p>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug">{a.def}</p>
                </div>
              ))}
              {filteredAcronyms.length === 0 && (
                <p className="text-sm text-muted-foreground">No acronyms match "{q}".</p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {CATS.map((cat) => {
                const items = ACRONYMS.filter((a) => a.cat === cat);
                if (items.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-indigo-600 mb-3">{cat}</p>
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-x-8 space-y-2.5">
                      {items.map((a) => (
                        <div key={a.term} className="break-inside-avoid border-l-2 border-muted pl-3 mb-2.5">
                          <p className="font-mono text-sm font-semibold">{a.term}</p>
                          <p className="text-sm text-muted-foreground leading-snug">{a.def}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Formulas */}
        <Card className="p-6" id="formulas">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Formulas &amp; ratios</p>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-2">
            {filteredFormulas.map((f) => (
              <div key={f.name} className="flex items-baseline gap-3 py-1.5 border-b last:border-b-0">
                <p className="font-medium text-sm flex-1 min-w-0 truncate">{f.name}</p>
                <p className="font-mono text-xs text-muted-foreground text-right">{f.formula}</p>
              </div>
            ))}
            {filteredFormulas.length === 0 && (
              <p className="text-sm text-muted-foreground">No formulas match "{q}".</p>
            )}
          </div>
        </Card>

        {/* Deal stages */}
        <Card className="p-6" id="stages">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Typical deal stages</p>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {DEAL_STAGES.map((s) => (
              <div key={s.stage} className="break-inside-avoid">
                <p className="font-medium text-sm mb-0.5">{s.stage}</p>
                <p className="text-sm text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
