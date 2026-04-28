import * as XLSX from '@e965/xlsx';

export type PLCategory =
  | 'revenue' | 'cogs' | 'gross_profit'
  | 'sales_marketing' | 'research_development' | 'general_administrative'
  | 'other_opex' | 'ebitda' | 'depreciation' | 'amortization'
  | 'interest' | 'tax' | 'net_income' | 'unmapped';

export type ParsedLineItem = {
  raw_label: string;
  category: PLCategory;
  period_label: string;
  period_start: string | null;
  period_end: string | null;
  amount: number;
  source_row: number;
};

export type ParseResult = {
  success: boolean;
  line_items: ParsedLineItem[];
  periods_detected: number;
  rows_parsed: number;
  error?: string;
};

// Skip these rows entirely - they are subtotals/totals that would double-count
const SKIP_PATTERNS = [
  /^total\s+revenue/i,
  /^total\s+sales/i,
  /^total\s+income/i,
  /^net\s+revenue/i,
  /^net\s+sales/i,
  /^total\s+expense/i,
  /^total\s+expenses/i,
  /^total\s+operating/i,
  /^gross\s+profit/i,
  /^gross\s+margin/i,
  /^net\s+income/i,
  /^net\s+profit/i,
  /^net\s+earnings/i,
  /^operating\s+income/i,
  /^operating\s+profit/i,
  /^ebitda/i,
];

function shouldSkip(label: string): boolean {
  return SKIP_PATTERNS.some((p) => p.test(label.trim()));
}

// Order matters: more specific rules first
const CATEGORY_RULES: Array<{ category: PLCategory; keywords: string[] }> = [
  { category: 'cogs', keywords: ['cost of goods sold', 'cost of sales', 'cost of revenue', 'cost of services', 'cogs', 'direct costs'] },
  { category: 'sales_marketing', keywords: ['sales and marketing', 'sales & marketing', 's&m', 'marketing expense', 'advertising', 'sales expense'] },
  { category: 'research_development', keywords: ['research and development', 'r&d', 'research & development', 'product development', 'engineering expense'] },
  { category: 'general_administrative', keywords: ['general and administrative', 'g&a', 'general & administrative', 'admin expense', 'office expense', 'rent', 'utilities', 'insurance', 'professional fees', 'legal', 'accounting'] },
  { category: 'depreciation', keywords: ['depreciation'] },
  { category: 'amortization', keywords: ['amortization'] },
  { category: 'interest', keywords: ['interest expense', 'interest income', 'interest'] },
  { category: 'tax', keywords: ['income tax', 'tax expense', 'taxes', 'provision for tax'] },
  { category: 'other_opex', keywords: ['operating expense', 'opex'] },
  { category: 'revenue', keywords: ['subscription revenue', 'service revenue', 'product revenue', 'recurring revenue', 'license revenue', 'revenue', 'sales', 'income from operations'] },
];

function categorize(rawLabel: string): PLCategory {
  const lower = rawLabel.toLowerCase().trim();
  if (!lower) return 'unmapped';
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) return rule.category;
    }
  }
  return 'unmapped';
}

const MONTH_NAMES = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec', 'january', 'february', 'march', 'april', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];

function looksLikePeriodHeader(value: unknown): boolean {
  if (value == null) return false;
  const s = String(value).toLowerCase().trim();
  if (!s) return false;
  if (/q[1-4]\s*[\-\/]?\s*20\d{2}/.test(s) || /20\d{2}\s*q[1-4]/.test(s)) return true;
  if (/^(fy\s*)?20\d{2}$/.test(s)) return true;
  if (MONTH_NAMES.some((m) => s.startsWith(m))) return true;
  if (/^20\d{2}[\-\/]\d{1,2}$/.test(s)) return true;
  if (['ttm', 'ytd', 'total', 'amount', 'balance'].includes(s)) return true;
  return false;
}

function parsePeriodToDates(label: string): { start: string | null; end: string | null } {
  const s = label.toLowerCase().trim();
  const qMatch = s.match(/q([1-4])\s*[\-\/]?\s*(20\d{2})/) || s.match(/(20\d{2})\s*q([1-4])/);
  if (qMatch) {
    const year = qMatch[1].length === 4 ? qMatch[1] : qMatch[2];
    const q = parseInt(qMatch[1].length === 4 ? qMatch[2] : qMatch[1], 10);
    const startMonth = (q - 1) * 3 + 1;
    const endMonth = q * 3;
    const start = year + '-' + String(startMonth).padStart(2, '0') + '-01';
    const lastDay = new Date(parseInt(year), endMonth, 0).getDate();
    const end = year + '-' + String(endMonth).padStart(2, '0') + '-' + lastDay;
    return { start, end };
  }
  const yMatch = s.match(/^(?:fy\s*)?(20\d{2})$/);
  if (yMatch) return { start: yMatch[1] + '-01-01', end: yMatch[1] + '-12-31' };
  const monthIdx = MONTH_NAMES.findIndex((m) => s.startsWith(m));
  if (monthIdx >= 0) {
    const yearMatch = s.match(/20\d{2}/);
    if (yearMatch) {
      const month = (monthIdx % 12) + 1;
      const year = yearMatch[0];
      const lastDay = new Date(parseInt(year), month, 0).getDate();
      return {
        start: year + '-' + String(month).padStart(2, '0') + '-01',
        end: year + '-' + String(month).padStart(2, '0') + '-' + lastDay,
      };
    }
  }
  return { start: null, end: null };
}

function coerceNumber(value: unknown): number | null {
  if (value == null || value === '') return null;
  if (typeof value === 'number') return isFinite(value) ? value : null;
  let s = String(value).trim();
  if (!s) return null;
  let negative = false;
  if (s.startsWith('(') && s.endsWith(')')) { negative = true; s = s.slice(1, -1); }
  if (s.startsWith('-')) { negative = true; s = s.slice(1); }
  s = s.replace(/[$£€,\s]/g, '');
  if (!s || s === '-') return null;
  const n = parseFloat(s);
  if (!isFinite(n)) return null;
  return negative ? -n : n;
}

export function parseFinancialFile(buffer: ArrayBuffer, fileName: string): ParseResult {
  try {
    const wb = XLSX.read(buffer, { type: 'array', cellDates: false });
    const ws = wb.Sheets[wb.SheetNames[0]];
    if (!ws) return { success: false, line_items: [], periods_detected: 0, rows_parsed: 0, error: 'No sheets found' };

    const rows: unknown[][] = XLSX.utils.sheet_to_json(ws, { header: 1, defval: null, blankrows: false });
    if (rows.length === 0) return { success: false, line_items: [], periods_detected: 0, rows_parsed: 0, error: 'File is empty' };

    let headerRowIdx = -1;
    let maxPeriodCount = 0;
    for (let i = 0; i < Math.min(rows.length, 20); i++) {
      const row = rows[i];
      const periodCount = row.filter(looksLikePeriodHeader).length;
      if (periodCount > maxPeriodCount) {
        maxPeriodCount = periodCount;
        headerRowIdx = i;
      }
    }

    if (headerRowIdx < 0 || maxPeriodCount === 0) {
      return { success: false, line_items: [], periods_detected: 0, rows_parsed: 0, error: 'Could not detect period headers' };
    }

    const headerRow = rows[headerRowIdx];
    const periodCols: { col: number; label: string }[] = [];
    for (let c = 0; c < headerRow.length; c++) {
      if (looksLikePeriodHeader(headerRow[c])) {
        periodCols.push({ col: c, label: String(headerRow[c]).trim() });
      }
    }

    const labelCol = 0;
    const lineItems: ParsedLineItem[] = [];
    for (let r = headerRowIdx + 1; r < rows.length; r++) {
      const row = rows[r];
      const rawLabel = row[labelCol];
      if (rawLabel == null || String(rawLabel).trim() === '') continue;
      const labelStr = String(rawLabel).trim();
      if (shouldSkip(labelStr)) continue;
      const hasAnyNumber = periodCols.some((pc) => coerceNumber(row[pc.col]) != null);
      if (!hasAnyNumber) continue;

      const category = categorize(labelStr);
      for (const pc of periodCols) {
        const amount = coerceNumber(row[pc.col]);
        if (amount == null) continue;
        const dates = parsePeriodToDates(pc.label);
        lineItems.push({
          raw_label: labelStr,
          category,
          period_label: pc.label,
          period_start: dates.start,
          period_end: dates.end,
          amount,
          source_row: r + 1,
        });
      }
    }

    return {
      success: true,
      line_items: lineItems,
      periods_detected: periodCols.length,
      rows_parsed: lineItems.length,
    };
  } catch (e: any) {
    return { success: false, line_items: [], periods_detected: 0, rows_parsed: 0, error: e?.message ?? 'Parse failed' };
  }
}