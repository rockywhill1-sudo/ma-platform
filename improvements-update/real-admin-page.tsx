import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { getAppSettings, isAppAdmin } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { updateAppSettings } from '@/app/actions';

export async function RealAdminPage({ companyId }: { companyId: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const settings = await getAppSettings();
  const admin = await isAppAdmin(user?.id);

  // Workspace info
  const { data: company } = await supabase
    .from('companies')
    .select('name, industry, currency, fiscal_year_end_month, created_at')
    .eq('id', companyId)
    .single();

  return (
    <>
      <PageHeader title="Admin" description="Workspace and platform settings" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        {/* Current user */}
        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Signed in as</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{user?.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">User ID</p>
              <p className="text-sm font-mono break-all">{user?.id ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Platform admin</p>
              <p className="text-sm font-medium">{admin ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>

        {/* Workspace settings */}
        {company && (
          <Card className="p-6">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Workspace</p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Name</p>
                <p className="text-sm font-medium">{company.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Industry</p>
                <p className="text-sm">{company.industry || '-'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Currency</p>
                <p className="text-sm font-mono">{company.currency}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Fiscal year end</p>
                <p className="text-sm">Month {company.fiscal_year_end_month}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Global platform settings - admin only */}
        {admin && (
          <Card className="p-6">
            <div className="mb-4">
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Platform settings</p>
              <p className="text-sm text-muted-foreground">Global settings affect all workspaces and the public landing page.</p>
            </div>
            <form action={updateAppSettings} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Platform name</label>
                <p className="text-xs text-muted-foreground mb-2">Shown in the sidebar logo and across the app.</p>
                <input
                  type="text"
                  name="platform_name"
                  defaultValue={settings.platform_name}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Browser tab title</label>
                <p className="text-xs text-muted-foreground mb-2">Text shown in the browser tab and bookmarks.</p>
                <input
                  type="text"
                  name="browser_title"
                  defaultValue={settings.browser_title}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Footer text</label>
                <p className="text-xs text-muted-foreground mb-2">Appears at the bottom of every page.</p>
                <input
                  type="text"
                  name="footer_text"
                  defaultValue={settings.footer_text}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Admin user IDs</label>
                <p className="text-xs text-muted-foreground mb-2">Comma-separated list of user IDs who can edit platform settings. Leave empty to allow all users (use only for setup).</p>
                <textarea
                  name="admin_user_ids"
                  defaultValue={settings.admin_user_ids}
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono"
                />
              </div>
              <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">
                Save platform settings
              </button>
            </form>
          </Card>
        )}

        {!admin && (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Platform settings can only be edited by app admins.</p>
          </Card>
        )}
      </div>
    </>
  );
}
