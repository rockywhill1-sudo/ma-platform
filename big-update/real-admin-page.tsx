import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { getAppSettings, isAppAdmin } from '@/lib/settings';
import { createClient } from '@/lib/supabase/server';
import { updateAppSettings, inviteTeamMember } from '@/app/actions';

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

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('first_name, last_name')
    .eq('user_id', user?.id ?? '')
    .maybeSingle();

  const { data: invites } = await supabase
    .from('workspace_invites')
    .select('id, email, role, status, created_at')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  const fullName = ((profile?.first_name ?? '') + ' ' + (profile?.last_name ?? '')).trim() || (user?.email?.split('@')[0] ?? '-');

  return (
    <>
      <PageHeader title="Admin" description="Workspace, team, and platform settings" />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        {/* Profile summary */}
        <Card className="p-6">
          <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Signed in as</p>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Name</p>
              <p className="text-sm font-medium">{fullName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-medium">{user?.email ?? '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Platform admin</p>
              <p className="text-sm font-medium">{admin ? 'Yes' : 'No'}</p>
            </div>
          </div>
          <a href="/profile" className="text-sm text-indigo-600 hover:underline mt-3 inline-block">Edit profile →</a>
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

        {/* Team Members - stub */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Team members</p>
              <p className="text-sm text-muted-foreground">Invite teammates to collaborate on this workspace.</p>
            </div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-warning bg-warning/10 px-2 py-1 rounded">Beta</span>
          </div>

          <form action={inviteTeamMember} className="flex gap-2 items-end mb-4 pb-4 border-b">
            <input type="hidden" name="company_id" value={companyId} />
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1 block">Email</label>
              <input type="email" name="email" required placeholder="teammate@example.com" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
            </div>
            <div className="w-32">
              <label className="text-xs text-muted-foreground mb-1 block">Role</label>
              <select name="role" className="w-full px-3 py-2 rounded-md border bg-background text-sm">
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Invite</button>
          </form>

          <div className="space-y-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Pending invitations</p>
            {!invites || invites.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pending invites.</p>
            ) : (
              <div className="space-y-1">
                {invites.map((i) => (
                  <div key={i.id} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="text-sm font-medium">{i.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{i.role} · {i.status}</p>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{new Date(i.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground italic mt-3">Email delivery and acceptance flow coming in next release. Invites are recorded but emails are not yet sent automatically.</p>
          </div>
        </Card>

        {admin && (
          <>
            {/* Branding + logo */}
            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Platform branding</p>
                <p className="text-sm text-muted-foreground">Logo, name, and footer shown across the app and on the landing page.</p>
              </div>
              <form action={updateAppSettings} className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-1">Logo URL</label>
                  <p className="text-xs text-muted-foreground mb-2">Paste a public URL to your logo (PNG or SVG, square works best). Leave empty to use the default blue square.</p>
                  <input type="url" name="logo_url" defaultValue={settings.logo_url} placeholder="https://example.com/logo.png" className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  {settings.logo_url && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Current logo:</p>
                      <img src={settings.logo_url} alt="Current logo" className="h-10 rounded border bg-white" />
                    </div>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium block mb-1">Platform name</label>
                    <input type="text" name="platform_name" defaultValue={settings.platform_name} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Browser tab title</label>
                    <input type="text" name="browser_title" defaultValue={settings.browser_title} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium block mb-1">Footer text</label>
                  <input type="text" name="footer_text" defaultValue={settings.footer_text} className="w-full px-3 py-2 rounded-md border bg-background text-sm" />
                </div>
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save branding</button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Landing page content</p>
                <p className="text-sm text-muted-foreground">Edit hero text, button labels, and nav. Changes appear instantly. No deploy needed.</p>
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
                <button type="submit" className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90">Save landing page</button>
              </form>
            </Card>

            <Card className="p-6">
              <div className="mb-4">
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Access control</p>
                <p className="text-sm text-muted-foreground">Comma-separated user IDs allowed to edit platform settings. Leave empty to allow all users.</p>
              </div>
              <form action={updateAppSettings} className="space-y-4">
                <textarea name="admin_user_ids" defaultValue={settings.admin_user_ids} rows={2} className="w-full px-3 py-2 rounded-md border bg-background text-sm font-mono" />
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
