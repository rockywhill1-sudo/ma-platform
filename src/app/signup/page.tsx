'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/primitives';
import { signup, type SignupState } from './actions';

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupState, FormData>(signup, null);

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-primary text-primary-foreground p-12">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-sm bg-primary-foreground/90" />
          <span className="font-semibold tracking-tight text-sm">M&amp;A Platform</span>
        </div>
        <div className="space-y-6 max-w-md">
          <p className="text-2xl font-medium leading-snug tracking-tight">Every deal. One source of truth.</p>
          <ul className="space-y-3 text-sm text-primary-foreground/80">
            <li className="flex gap-3"><span className="font-mono text-xs text-primary-foreground/50 pt-0.5">01</span><span>Connect QuickBooks, Xero, Sage, NetSuite or upload financials directly.</span></li>
            <li className="flex gap-3"><span className="font-mono text-xs text-primary-foreground/50 pt-0.5">02</span><span>Automated QoE, anomaly detection, signals engine.</span></li>
            <li className="flex gap-3"><span className="font-mono text-xs text-primary-foreground/50 pt-0.5">03</span><span>Investor-grade reports in one click.</span></li>
          </ul>
        </div>
        <p className="text-xs text-primary-foreground/60">© {new Date().getFullYear()}</p>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h1 className="text-xl font-semibold tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">Start your first deal workspace in under two minutes.</p>
          </div>
          <form action={formAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" type="text" autoComplete="name" required disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Work email</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required disabled={pending} />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>
            {state?.error && <p className="text-sm text-destructive font-medium" role="alert">{state.error}</p>}
            <Button type="submit" className="w-full" disabled={pending}>{pending ? 'Creating account…' : 'Create account'}</Button>
          </form>
          <p className="text-sm text-muted-foreground text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
