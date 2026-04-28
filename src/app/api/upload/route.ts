import { NextResponse } from 'next/server';
import { parseUploadInline } from '@/lib/inline-parse';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { createClient } from '@/lib/supabase/server';
import type { UploadKind } from '@/lib/types';

export const runtime = 'nodejs';

function detectKind(name: string): UploadKind {
  const n = name.toLowerCase();
  if (n.includes('gl') || n.includes('general_ledger') || n.includes('general-ledger')) return 'general_ledger';
  if (n.includes('trial') || n.includes('tb_')) return 'trial_balance';
  if (n.includes('saas') || n.includes('hvac') || n.includes('manufacturing') || n.includes('services') || n.includes('ecommerce') || n.includes('healthcare') || n.includes('p_and_l') || n.includes('p&l') || n.includes('p-and-l') || n.includes('pl_') || n.includes('pl-') || n.startsWith('pl.') || n.includes('-pl.') || n.includes('test-pl') || n.includes('income') || n.includes('profit') || n.includes('p_l')) return 'income_statement';
  if (n.includes('balance') || n.includes('bs_')) return 'balance_sheet';
  if (n.includes('cash_flow') || n.includes('cashflow') || n.includes('cf_')) return 'cash_flow';
  if (n.includes('coa') || n.includes('chart_of_accounts')) return 'chart_of_accounts';
  if (n.includes('customer')) return 'customer_detail';
  if (n.includes('ar_aging') || n.includes('ar-aging')) return 'ar_aging';
  if (n.includes('ap_aging') || n.includes('ap-aging')) return 'ap_aging';
  if (n.includes('bank_stmt') || n.includes('bank-stmt') || n.includes('bank_statement')) return 'bank_statement';
  if (n.includes('tax')) return 'tax_return';
  if (n.includes('cim')) return 'cim';
  if (n.includes('contract')) return 'contract';
  return 'other';
}

type R2Bucket = {
  put(key: string, value: ArrayBuffer | Blob, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  delete(key: string): Promise<void>;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const auth = await supabase.auth.getUser();
    const user = auth.data.user;
    if (!user) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

    const fd = await req.formData();
    const file = fd.get('file') as File | null;
    const companyId = fd.get('company_id') as string | null;
    if (!file || !companyId) return NextResponse.json({ error: 'Missing file or company_id' }, { status: 400 });

    const fileName: string = file.name;
    const fileType: string = file.type || 'application/octet-stream';
    const fileSize: number = file.size;

    const companyResult = await supabase.from('companies').select('id').eq('id', companyId).single();
    if (!companyResult.data) return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });

    const env = (await getCloudflareContext()).env as { UPLOADS?: R2Bucket };
    if (!env.UPLOADS) return NextResponse.json({ error: 'R2 binding missing' }, { status: 500 });

    const ext = fileName.includes('.') ? fileName.split('.').pop() : 'bin';
    const r2Key = 'companies/' + companyId + '/uploads/' + crypto.randomUUID() + '.' + ext;
    const buf = await file.arrayBuffer();

    await env.UPLOADS.put(r2Key, buf, {
      httpMetadata: { contentType: fileType },
    });

    const insertResult = await supabase.from('uploads').insert({
      company_id: companyId,
      uploaded_by: user.id,
      file_name: fileName,
      file_size: fileSize,
      mime_type: fileType,
      r2_key: r2Key,
      kind: detectKind(fileName),
      status: 'uploaded',
    }).select('id').single();

    if (insertResult.error || !insertResult.data) {
      await env.UPLOADS.delete(r2Key);
      return NextResponse.json({ error: insertResult.error?.message || 'DB insert failed' }, { status: 500 });
    }

    const newId: string = insertResult.data.id;
    await parseUploadInline(newId).catch(console.error);

    return NextResponse.json({ ok: true, upload_id: newId });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Upload failed' }, { status: 500 });
  }
}