'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/primitives';
import { createCompany } from '@/app/actions';

export default function NewCompanyPage() {
  const [state, formAction, pending] = useActionState<{ error?: string } | null, FormData>(createCompany, null);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-1 text-center">
          <h1 className="text-xl font-semibold tracking-tight">Create your first workspace</h1>
          <p className="text-sm text-muted-foreground">One workspace per deal or acquisition target.</p>
        </div>
        <form action={formAction} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Company name</Label>
            <Input id="name" name="name" placeholder="Acme Industrial, Inc." required disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input id="industry" name="industry" placeholder="Software, HVAC, Manufacturing..." disabled={pending} />
          </div>
          {state?.error && <p className="text-sm text-destructive font-medium">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creating…' : 'Create workspace'}</Button>
        </form>
      </div>
    </div>
  );
}