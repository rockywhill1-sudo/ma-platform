'use client';

import { Suspense, useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/primitives';
import { login } from './actions';

function LoginForm() {
  const sp = useSearchParams();
  const next = sp.get('next') ?? '/';
  const [state, formAction, pending] = useActionState<{ error?: string } | null, FormData>(login, null);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required disabled={pending} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required disabled={pending} />
      </div>
      {state?.error && <p className="text-sm text-destructive font-medium" role="alert">{state.error}</p>}
      <Button type="submit" className="w-full bg-gradient-to-r from-indigo-600 to-blue-500 hover:opacity-90 shadow-md" disabled={pending}>
        {pending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-50">
      {/* Left side: branded gradient */}
      <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 -z-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        </div>
        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-white/20 backdrop-blur" />
          <span className="font-semibold tracking-tight">M&amp;A Platform</span>
        </Link>

        <div className="relative z-10 max-w-md space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Investor-grade intelligence</span>
          </div>
          <p className="text-3xl font-semibold leading-tight tracking-tight">
            Welcome back.
          </p>
          <p className="text-base opacity-90 leading-relaxed">
            From raw P&amp;L to investor-ready signals, valuations, and reports , all in one place.
          </p>
        </div>

        <p className="relative z-10 text-xs opacity-60">© {new Date().getFullYear()}</p>
      </div>

      {/* Right side: login form */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-sm space-y-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-slate-500">Enter your credentials to continue.</p>
          </div>
          <Suspense fallback={<div className="h-64" />}>
            <LoginForm />
          </Suspense>
          <div className="space-y-3 text-center">
            <p className="text-sm text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="text-indigo-600 font-medium hover:underline">Sign up</Link>
            </p>
            <p className="text-sm text-slate-500">
              <Link href="/demo" className="hover:underline">Try the demo without signing in →</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
