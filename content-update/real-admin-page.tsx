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

  const { data: company } = await supabase
    .from('companies')
    .select('name, industry, currency, fiscal_year_end_month, created_at')
    .eq('id', companyId)
    .single();

  return (
    <>
      <PageHeader title="Admin" description="Workspace and platform settings" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

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

        {admin && (
          <>
            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Platform branding</p>
                <p className="text-sm text-muted-foreground">Global settings affect all workspaces and the public landing page.</p>
              </div>
              <form action={updateAppSettings} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Platform name</label>
                    <p className="text-xs text-muted-foreground mb-2">Sidebar logo and across the app.</p>
                    <input type="text" name="platform_name" defaultValue={settings.platform_name} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Browser tab title</label>
                    <p className="text-xs text-muted-foreground mb-2">Browser tabs and bookmarks.</p>
                    <input type="text" name="browser_title" defaultValue={settings.browser_title} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Footer text</label>
                  <p className="text-xs text-muted-foreground mb-2">Bottom of every page.</p>
                  <input type="text" name="footer_text" defaultValue={settings.footer_text} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save branding</button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Landing page content</p>
                <p className="text-sm text-muted-foreground">Edit hero text, button labels, and nav. Changes appear at mergers.neaigroup.com instantly. No deploy needed.</p>
              </div>
              <form action={updateAppSettings} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Hero headline (line 1)</label>
                  <input type="text" name="hero_headline" defaultValue={settings.hero_headline} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Hero headline (line 2)</label>
                  <input type="text" name="hero_headline_2" defaultValue={settings.hero_headline_2} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Hero subheadline</label>
                  <textarea name="hero_subheadline" defaultValue={settings.hero_subheadline} rows={3} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Demo button label</label>
                    <input type="text" name="hero_demo_button" defaultValue={settings.hero_demo_button} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Sign up button label</label>
                    <input type="text" name="hero_signup_button" defaultValue={settings.hero_signup_button} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Subtext under buttons</label>
                  <input type="text" name="hero_subtext" defaultValue={settings.hero_subtext} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Top nav: Demo</label>
                    <input type="text" name="nav_demo_link" defaultValue={settings.nav_demo_link} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Top nav: Sign in</label>
                    <input type="text" name="nav_signin_link" defaultValue={settings.nav_signin_link} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Top nav: Sign up</label>
                    <input type="text" name="nav_signup_link" defaultValue={settings.nav_signup_link} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                </div>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save landing page content</button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Access control</p>
                <p className="text-sm text-muted-foreground">Comma-separated user IDs that can edit platform settings. Leave empty to allow all users.</p>
              </div>
              <form action={updateAppSettings} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Admin user IDs</label>
                  <textarea name="admin_user_ids" defaultValue={settings.admin_user_ids} rows={2} className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save access control</button>
              </form>
            </Card>
          </>
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
