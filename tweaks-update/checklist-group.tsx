'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/primitives';
import { CheckCircle2, Circle, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

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

export function ChecklistGroup({
  checklists,
  companyId,
  toggleTaskAction,
  deleteAction,
}: {
  checklists: Checklist[];
  companyId: string;
  toggleTaskAction: (fd: FormData) => void;
  deleteAction: (fd: FormData) => void;
}) {
  // Default all open for printing; user can collapse
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 print:hidden text-xs">
        <button
          onClick={() => setOpenIds(new Set(checklists.map((c) => c.id)))}
          className="text-muted-foreground hover:text-foreground"
        >
          Expand all
        </button>
        <span className="text-muted-foreground">·</span>
        <button
          onClick={() => setOpenIds(new Set())}
          className="text-muted-foreground hover:text-foreground"
        >
          Collapse all
        </button>
      </div>

      {checklists.map((c) => {
        const done = c.tasks.filter((t) => t.status === 'done').length;
        const total = c.tasks.length;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const isOpen = openIds.has(c.id);

        return (
          <Card key={c.id} className="overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between gap-4 cursor-pointer hover:bg-muted/30" onClick={() => toggle(c.id)}>
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 print:hidden" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 print:hidden" />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold tracking-tight">{c.title}</h3>
                  <p className="text-xs text-muted-foreground tabular-nums mt-0.5">
                    {done} / {total} complete · {pct}%
                  </p>
                </div>
              </div>
              <div className="h-1.5 w-32 bg-muted rounded-full overflow-hidden shrink-0">
                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <form action={deleteAction} className="print:hidden" onClick={(e) => e.stopPropagation()}>
                <input type="hidden" name="checklist_id" value={c.id} />
                <input type="hidden" name="company_id" value={companyId} />
                <button type="submit" className="text-muted-foreground hover:text-destructive p-1" title="Remove this workflow">
                  <Trash2 className="h-4 w-4" />
                </button>
              </form>
            </div>

            {(isOpen || true) && (
              <div className={`divide-y ${isOpen ? '' : 'hidden print:block'}`}>
                {c.tasks.map((task) => {
                  const isDone = task.status === 'done';
                  return (
                    <form key={task.id} action={toggleTaskAction} className="px-5 py-3 hover:bg-muted/30 print:hover:bg-transparent">
                      <input type="hidden" name="task_id" value={task.id} />
                      <input type="hidden" name="company_id" value={companyId} />
                      <input type="hidden" name="status" value={isDone ? 'pending' : 'done'} />
                      <button type="submit" className="flex items-start gap-3 w-full text-left">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isDone ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                            {task.title}
                          </p>
                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{task.description}</p>
                          )}
                        </div>
                        {isDone && task.completed_at && (
                          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground shrink-0 mt-0.5">
                            {new Date(task.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </button>
                    </form>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
