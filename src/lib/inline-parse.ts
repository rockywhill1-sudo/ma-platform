'use server';
import { createClient } from '@/lib/supabase/server';
import { parseFinancialFile } from '@/lib/parser';
import { getCloudflareContext } from '@opennextjs/cloudflare';

type R2Bucket = {
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
};

export async function parseUploadInline(uploadId: string) {
  const supabase = await createClient();
  const fetched = await supabase.from('uploads').select('*').eq('id', uploadId).single();
  const upload = fetched.data;
  if (!upload) return;

  const companyId = upload.company_id;

  await supabase.from('uploads').update({ parse_status: 'processing' }).eq('id', uploadId);

  const env = (await getCloudflareContext()).env as { UPLOADS?: R2Bucket };
  if (!env.UPLOADS) {
    await supabase.from('uploads').update({ parse_status: 'failed', last_parse_error: 'R2 missing' }).eq('id', uploadId);
    return;
  }

  try {
    const obj = await env.UPLOADS.get(upload.r2_key);
    if (!obj) throw new Error('R2 object not found');
    const buffer = await obj.arrayBuffer();
    const result = await parseFinancialFile(buffer, upload.file_name, upload.mime_type || '');

    if (!result.success) throw new Error(result.error || 'parse failed');

    const items = result.line_items;
    if (items && items.length > 0) {
      const rows = [];
      for (const li of items) {
        rows.push({
          upload_id: uploadId,
          company_id: companyId,
          raw_label: li.raw_label,
          category: li.category,
          period_label: li.period_label,
          period_start: li.period_start,
          period_end: li.period_end,
          amount: li.amount,
          source_row: li.source_row,
        });
      }
      const batchSize = 500;
      for (let i = 0; i < rows.length; i += batchSize) {
        await supabase.from('pl_line_items').insert(rows.slice(i, i + batchSize));
      }
    }

    await supabase.rpc('refresh_period_summaries', { p_company_id: companyId });
    await supabase.from('uploads').update({ parse_status: 'parsed', status: 'parsed' }).eq('id', uploadId);
  } catch (e: any) {
    const msg = e && e.message ? e.message : String(e);
    await supabase.from('uploads').update({ parse_status: 'failed', last_parse_error: msg }).eq('id', uploadId);
  }
}