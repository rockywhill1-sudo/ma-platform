'use client';

import { Button } from '@/components/ui/button';

export function DashboardActions() {
  return (
    <Button variant="outline" size="md" onClick={() => window.print()}>Export</Button>
  );
}
