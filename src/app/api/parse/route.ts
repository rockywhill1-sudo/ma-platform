import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createClient } from '@/lib/supabase/server';
import { parseFinancialFile } from '@/lib/parser';

export const runtime = 'nodejs';

type R2Bucket = {
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
};

export async function POST(req: Request) {
  try {
    const { upload_id } = await req.json();
    if (!upload_id) return NextResponse.json({ error: 'Missing upload_id' }, { status: 400 });

    const supabase = await createClient();

    const { data: upload, error: fetchErr } = await supabase
      .from('uploads')
      .select('*')
      .eq('id', upload_id)
      .single();
    if (fetchErr || !upload) return NextResponse.json({ error: 'Upload not found' }, { status: 404 });

    await supabase.from('uploads').update({ status: 'processing', parse_status: 'pending' }).eq('id', upload_id);

    const env = (await getCloudflareContext()).env as { UPLOADS?: R2Bucket };
    if (!env.UPLOADS) {
      await supabase.from('uploads').update({ status: 'failed', parse_status: 'failed', last_parse_error: 'R2 binding missing' }).eq('id', upload_id);
      return NextResponse.json({ error: 'R2 binding missing' }, { status: 500 });
    }

    const obj = await env.UPLOADS.get(upload.r2_key);
    if (!obj) {
      await supabase.from('uploads').update({ status: 'failed', parse_status: 'failed', last_parse_error: 'File not found in storage' }).eq('id', upload_id);
      return NextResponse.json({ error: 'File not in R2' }, { status: 404 });
    }

    const buffer = await obj.arrayBuffer();
    const supportedKinds = ['general_ledger', 'trial_balance', 'income_statement', 'balance_sheet', 'cash_flow', 'chart_of_accounts'];
    const ext = upload.file_name.toLowerCase().split('.').pop();

    if (!['xlsx', 'xls', 'csv', 'tsv'].includes(ext || '')) {
      await supabase.from('uploads').update({
        status: 'stored_only',
        parse_status: 'success',
        last_parse_error: 'PDF and other formats not yet supported, file stored only',
      }).eq('id', upload_id);
      return NextResponse.json({ ok: true, parsed: false, reason: 'unsupported format' });
    }

    if (!supportedKinds.includes(upload.kind)) {
      await supabase.from('uploads').update({
        status: 'stored_only',
        parse_status: 'success',
        last_parse_error: 'File kind does not have a parser yet, stored only',
      }).eq('id', upload_id);
      return NextResponse.json({ ok: true, parsed: false, reason: 'kind not parseable' });
    }

    const result = parseFinancialFile(buffer, upload.file_name);
    if (!result.success) {
      await supabase.from('uploads').update({
        status: 'failed',
        parse_status: 'failed',
        last_parse_error: result.error || 'Parse failed',
      }).eq('id', upload_id);
      return NextResponse.json({ error: result.error || 'Parse failed' }, { status: 500 });
    }

    await supabase.from('pl_line_items').delete().eq('upload_id', upload_id);

    const BATCH = 200;
    for (let i = 0; i < result.line_items.length; i += BATCH) {
      const batch = result.line_items.slice(i, i + BATCH).map((li) => ({
        company_id: upload.company_id,
        upload_id: upload_id,
        period_label: li.period_label,
        period_start: li.period_start,
        period_end: li.period_end,
        raw_label: li.raw_label,
        category: li.category,
        amount: li.amount,
        currency: 'USD',
        source_row: li.source_row,
      }));
      const { error: insertErr } = await supabase.from('pl_line_items').insert(batch);
      if (insertErr) {
        await supabase.from('uploads').update({
          status: 'failed',
          parse_status: 'failed',
          last_parse_error: insertErr.message,
        }).eq('id', upload_id);
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }
    }

    await supabase.rpc('refresh_period_summaries', { p_company_id: upload.company_id });

    await supabase.from('uploads').update({
      status: 'parsed',
      parse_status: 'success',
      rows_parsed: result.rows_parsed,
      periods_detected: result.periods_detected,
      last_parse_error: null,
    }).eq('id', upload_id);

    return NextResponse.json({
      ok: true,
      parsed: true,
      rows_parsed: result.rows_parsed,
      periods_detected: result.periods_detected,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Parse failed' }, { status: 500 });
  }
}