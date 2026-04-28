import { Card } from '@/components/ui/primitives';
import { PageHeader } from '@/components/layout/shell';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import {
  createChecklistFromTemplate,
  toggleTaskStatus,
  deleteChecklist,
} from '@/app/companies/[companyId]/checklists/actions';
import { ChecklistsToolbar } from './checklists-toolbar';
import { ChecklistGroup } from './checklist-group';

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  completed_at: string | null;
  sort_order: number;
};

type Checklist = {
  id: string;
  template_id: string | null;
  title: string;
  created_at: string;
  tasks: Task[];
};

export async function RealChecklistsPage({ companyId }: { companyId: string }) {
  const supabase = await createClient();

  const { data: templates } = await supabase
    .from('checklist_templates')
    .select('*')
    .order('sort_order');

  const { data: checklists } = await supabase
    .from('checklists')
    .select('id, template_id, title, created_at')
    .eq('company_id', companyId);

  const checklistsWithTasks: Checklist[] = [];
  if (checklists) {
    for (const c of checklists) {
      const { data: tasks } = await supabase
        .from('checklist_tasks')
        .select('id, title, description, status, completed_at, sort_order')
        .eq('checklist_id', c.id)
        .order('sort_order');
      checklistsWithTasks.push({ ...c, tasks: tasks || [] });
    }
  }

  const activeTemplateIds = new Set(checklistsWithTasks.map((c) => c.template_id));
  const inactiveTemplates = (templates || []).filter((t) => !activeTemplateIds.has(t.id));

  const allTasks = checklistsWithTasks.flatMap((c) => c.tasks);
  const totalDone = allTasks.filter((t) => t.status === 'done').length;
  const totalTasks = allTasks.length;
  const overallPct = totalTasks > 0 ? Math.round((totalDone / totalTasks) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Checklists"
        description={
          totalTasks === 0
            ? 'Activate a workflow below to start tracking diligence tasks'
            : `${totalDone} of ${totalTasks} tasks complete (${overallPct}%) across ${checklistsWithTasks.length} workflow${checklistsWithTasks.length === 1 ? '' : 's'}`
        }
        actions={<ChecklistsToolbar />}
      />
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-8 py-6 space-y-6">

        {inactiveTemplates.length > 0 && (
          <Card className="p-5 print:hidden">
            <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mb-4">Activate workflow</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {inactiveTemplates.map((t) => (
                <form key={t.id} action={createChecklistFromTemplate}>
                  <input type="hidden" name="company_id" value={companyId} />
                  <input type="hidden" name="template_id" value={t.id} />
                  <button type="submit" className="block w-full text-left p-4 rounded-md border hover:border-primary hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-2.5 mb-2">
                      <Plus className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{t.title}</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-0.5">{t.category}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">{t.description}</p>
                  </button>
                </form>
              ))}
            </div>
          </Card>
        )}

        {checklistsWithTasks.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-base font-medium mb-2">No active workflows yet</p>
            <p className="text-sm text-muted-foreground">Activate a workflow above to start tracking diligence tasks for this deal.</p>
          </Card>
        ) : (
          <ChecklistGroup
            checklists={checklistsWithTasks}
            companyId={companyId}
            toggleTaskAction={toggleTaskStatus}
            deleteAction={deleteChecklist}
          />
        )}
      </div>
    </>
  );
}
