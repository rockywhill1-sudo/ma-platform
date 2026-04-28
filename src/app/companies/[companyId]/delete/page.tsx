import { notFound, redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { Trash2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function DeleteWorkspacePage({
  params,
}: {
  params: Promise<{ companyId: string }>;
}) {
  const { companyId } = await params;
  const supabase = await createClient();

  const auth = await supabase.auth.getUser();
  if (!auth.data.user) redirect('/login');

  const companyResult = await supabase
    .from('companies')
    .select('id, name, industry')
    .eq('id', companyId)
    .single();

  const company = companyResult.data;
  if (!company) notFound();

  async function performDelete(formData: FormData) {
    'use server';
    const confirmName = String(formData.get('confirm_name') ?? '').trim();
    const targetId = String(formData.get('company_id') ?? '');

    if (!confirmName || !targetId) {
      redirect('/companies/' + targetId + '/delete?error=missing');
    }

    const sb = await createClient();
    const a = await sb.auth.getUser();
    if (!a.data.user) redirect('/login');

    const result = await sb
      .from('companies')
      .select('name')
      .eq('id', targetId)
      .single();

    if (!result.data) {
      redirect('/');
    }

    if (result.data.name !== confirmName) {
      redirect('/companies/' + targetId + '/delete?error=mismatch');
    }

    await sb.from('companies').delete().eq('id', targetId);

    const remainingResult = await sb
      .from('companies')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1);

    revalidatePath('/', 'layout');

    if (remainingResult.data && remainingResult.data.length > 0) {
      redirect('/companies/' + remainingResult.data[0].id + '/dashboard');
    }
    redirect('/companies/new');
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="border-b bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href={'/companies/' + companyId + '/admin'}
            className="inline-flex items-center gap-1.5 text-sm text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to admin
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <div className="rounded-md border-2 border-red-300 bg-red-50 p-6">
          <div className="flex items-start gap-3 mb-5">
            <AlertTriangle className="h-6 w-6 text-red-600 shrink-0 mt-1" />
            <div>
              <h1 className="text-xl font-semibold text-red-900">
                Permanently delete this workspace?
              </h1>
              <p className="text-sm text-slate-700 mt-2">
                You are about to delete <strong>{company.name}</strong>{company.industry ? ' (' + company.industry + ')' : ''}.
                This will permanently remove all uploaded files, parsed P&amp;L data,
                signals, reports, checklists, timeline, and team invitations.
                This action cannot be undone.
              </p>
            </div>
          </div>

          <form action={performDelete} className="space-y-4 mt-6">
            <input type="hidden" name="company_id" value={companyId} />
            <div>
              <label className="text-sm font-medium block mb-1 text-slate-900">
                To confirm, type the workspace name below:
              </label>
              <p className="text-xs text-slate-600 mb-2 font-mono">
                {company.name}
              </p>
              <input
                type="text"
                name="confirm_name"
                required
                autoComplete="off"
                placeholder="Type the workspace name exactly"
                className="w-full px-3 py-2 rounded-md border border-slate-300 bg-white text-sm font-mono"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Link
                href={'/companies/' + companyId + '/admin'}
                className="px-4 py-2 rounded-md border bg-white text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete workspace permanently
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
