'use client';

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90"
    >
      Print or Save as PDF
    </button>
  );
}
