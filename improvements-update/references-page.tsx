import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';

const ACRONYMS = [
  { term: 'EBITDA', def: 'Earnings before interest, taxes, depreciation, and amortization. Standard proxy for operating cash flow.' },
  { term: 'TTM', def: 'Trailing twelve months. Sum of the most recent 4 quarters of financial data.' },
  { term: 'LTM', def: 'Last twelve months. Same as TTM.' },
  { term: 'QoE', def: 'Quality of Earnings. A diligence study that normalizes EBITDA, validates revenue recognition, and identifies addbacks.' },
  { term: 'COGS', def: 'Cost of goods sold. Direct costs of producing the goods or services sold.' },
  { term: 'OpEx', def: 'Operating expenses. SG&A, R&D, sales, marketing, etc.' },
  { term: 'SG&A', def: 'Selling, general, and administrative expenses.' },
  { term: 'CAC', def: 'Customer acquisition cost. Sales and marketing dollars spent to acquire one new customer.' },
  { term: 'LTV', def: 'Lifetime value. Total gross profit a customer generates over their relationship with the business.' },
  { term: 'NRR', def: 'Net revenue retention. Revenue from existing customers this period vs same group prior period, including upsells and churn. >100% is healthy.' },
  { term: 'GRR', def: 'Gross revenue retention. Same as NRR but excludes upsells. Measures pure churn.' },
  { term: 'ARR', def: 'Annual recurring revenue. Annualized subscription revenue.' },
  { term: 'MRR', def: 'Monthly recurring revenue.' },
  { term: 'ACV', def: 'Annual contract value. Average annualized value of customer contracts.' },
  { term: 'TCV', def: 'Total contract value. Total dollar value of a customer contract over its full term.' },
  { term: 'DSO', def: 'Days sales outstanding. Average days to collect AR after a sale.' },
  { term: 'DPO', def: 'Days payable outstanding. Average days to pay vendors.' },
  { term: 'DIO', def: 'Days inventory outstanding. Average days inventory is held before sale.' },
  { term: 'CCC', def: 'Cash conversion cycle. DSO + DIO − DPO. Lower is better.' },
  { term: 'NWC', def: 'Net working capital. Current assets minus current liabilities, excluding cash and debt.' },
  { term: 'CapEx', def: 'Capital expenditures. Money spent on long-term physical or intangible assets.' },
  { term: 'FCF', def: 'Free cash flow. Operating cash flow minus capex. The cash actually available to investors.' },
  { term: 'IRR', def: 'Internal rate of return. The discount rate at which NPV equals zero. The annualized return on an investment.' },
  { term: 'MOIC', def: 'Multiple on invested capital. Total cash returned divided by cash invested. Aka "money multiple."' },
  { term: 'NPV', def: 'Net present value. Future cash flows discounted to today.' },
  { term: 'WACC', def: 'Weighted average cost of capital. Blended cost of debt and equity used to discount cash flows.' },
  { term: 'EV', def: 'Enterprise value. Equity value + debt − cash. The total acquisition price.' },
  { term: 'EV/EBITDA', def: 'Enterprise value to EBITDA. Standard multiple for valuing private companies.' },
  { term: 'IOI', def: 'Indication of interest. Non-binding letter expressing initial purchase interest with rough valuation range.' },
  { term: 'LOI', def: 'Letter of intent. Non-binding offer with specific terms used to enter exclusivity.' },
  { term: 'NDA', def: 'Non-disclosure agreement. Confidentiality contract executed before sharing sensitive information.' },
  { term: 'CIM', def: 'Confidential information memorandum. Detailed marketing document prepared for sale process.' },
  { term: 'MNPI', def: 'Material non-public information. Subject to insider trading rules.' },
  { term: 'SPA', def: 'Stock purchase agreement. Definitive document for acquiring stock of a target.' },
  { term: 'APA', def: 'Asset purchase agreement. Definitive document for acquiring specific assets, not the whole entity.' },
  { term: 'R&W', def: 'Representations and warranties. Statements made by the seller in the SPA that, if untrue, expose them to liability.' },
  { term: 'RWI', def: 'Representations and warranties insurance. Policy that covers buyer for breaches of seller R&W.' },
  { term: 'Earnout', def: 'Contingent payment to seller based on post-close performance.' },
  { term: 'Holdback', def: 'Portion of purchase price withheld at close for a defined period as protection against breaches.' },
  { term: 'Escrow', def: 'Funds held by a third party as security for indemnification claims.' },
  { term: 'Indemnification', def: 'Seller obligation to compensate buyer for losses from breaches of reps and warranties.' },
  { term: 'Working capital target', def: 'Normalized working capital level expected at close. Excess returned to seller, shortfall reduces price.' },
  { term: 'Closing', def: 'The date the transaction legally consummates and ownership transfers.' },
  { term: 'Pre-close', def: 'Period between LOI and closing during which final diligence and document drafting occur.' },
  { term: 'Post-close', def: 'Period after closing covering integration, true-ups, and earnout measurement.' },
  { term: 'Bolt-on', def: 'Acquisition added to an existing platform company in PE.' },
  { term: 'Platform', def: 'Initial PE acquisition that becomes the base for subsequent bolt-ons.' },
  { term: 'Roll-up', def: 'Strategy of acquiring multiple small companies in the same industry and consolidating them.' },
  { term: 'Synergies', def: 'Cost savings or revenue gains from combining two companies. Buy-side often models them; sell-side rarely should.' },
  { term: 'Pro forma', def: '"As if." Financials adjusted to reflect a hypothetical transaction or normalization.' },
  { term: 'Recurring', def: 'Revenue that contractually recurs - subscriptions, maintenance contracts, retainers.' },
  { term: 'Bookings', def: 'Total contract value committed in a period. Leading indicator of revenue.' },
  { term: 'Backlog', def: 'Bookings not yet recognized as revenue.' },
  { term: 'Concentration', def: 'Revenue dependence on a small number of customers. Top customer >10% is a flag.' },
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
  { name: 'Payback period', formula: 'Time for cumulative cash flow to equal initial investment' },
  { name: 'Customer LTV (simplified)', formula: '(ARPU × Gross margin %) ÷ Churn rate' },
  { name: 'CAC payback (months)', formula: 'CAC ÷ (Monthly ARR × Gross margin %)' },
  { name: 'Net revenue retention', formula: '((Starting MRR + Expansion − Churn) ÷ Starting MRR) × 100' },
];

const DEAL_STAGES = [
  { stage: '1. Sourcing', desc: 'Identifying potential acquisition targets through network, broker introductions, or proprietary outreach.' },
  { stage: '2. Initial review', desc: 'Sign NDA, receive teaser/CIM, do high-level financial review and strategic fit assessment.' },
  { stage: '3. IOI', desc: 'Submit indication of interest with valuation range and proposed structure. Non-binding.' },
  { stage: '4. Management meetings', desc: 'In-person or virtual meetings with leadership. Buyer evaluates fit, seller evaluates buyer credibility.' },
  { stage: '5. LOI', desc: 'Letter of intent with specific price and key terms. Usually establishes exclusivity period (30-60 days typical).' },
  { stage: '6. Diligence', desc: 'Financial QoE, legal review, commercial validation, tech assessment, HR review. The bulk of work.' },
  { stage: '7. Definitive docs', desc: 'Drafting and negotiating SPA/APA, disclosure schedules, ancillary agreements.' },
  { stage: '8. Sign and announce', desc: 'Execute definitive agreement. Announce internally and externally as appropriate.' },
  { stage: '9. Pre-close', desc: 'Regulatory approvals (HSR, etc), third-party consents, financing arrangement.' },
  { stage: '10. Close', desc: 'Funds wire, ownership transfers, integration begins.' },
  { stage: '11. Post-close', desc: 'Working capital true-up, earnout measurement, indemnification claims, integration execution.' },
];

export function ReferencesPage() {
  return (
    <>
      <PageHeader title="M&A References" description="Acronyms, formulas, and deal stage reference" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Acronyms & terms</p>
          <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
            {ACRONYMS.map((a) => (
              <div key={a.term} className="border-l-2 border-muted pl-3">
                <p className="font-mono text-sm font-semibold">{a.term}</p>
                <p className="text-sm text-muted-foreground leading-snug">{a.def}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Formulas & ratios</p>
          <div className="space-y-2">
            {FORMULAS.map((f) => (
              <div key={f.name} className="flex items-baseline gap-4 py-1.5 border-b last:border-b-0">
                <p className="font-medium text-sm w-64 shrink-0">{f.name}</p>
                <p className="font-mono text-sm text-muted-foreground">{f.formula}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Typical deal stages</p>
          <div className="space-y-3">
            {DEAL_STAGES.map((s) => (
              <div key={s.stage} className="flex items-baseline gap-4 py-1.5">
                <p className="font-medium text-sm w-44 shrink-0">{s.stage}</p>
                <p className="text-sm text-muted-foreground leading-snug">{s.desc}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}
