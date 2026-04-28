'use client';

import { Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ChecklistsToolbar() {
  return (
    <Button variant="outline" size="md" onClick={() => window.print()}>
      <Printer className="h-3.5 w-3.5" />
      Print or Save as PDF
    </Button>
  );
}
