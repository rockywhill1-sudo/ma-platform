'use client';

import { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import { uploadLogo } from '@/app/actions';

export function LogoUploadForm({ currentUrl }: { currentUrl?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState(currentUrl ?? '');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.set('logo', file);
      const result = await uploadLogo(fd);
      if ((result as any)?.error) {
        setError((result as any).error);
      } else if ((result as any)?.url) {
        setUrl((result as any).url);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">
        Upload a logo (PNG, JPG, SVG up to 2MB). Square works best.
      </p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="px-4 py-2 rounded-md border bg-background text-sm font-medium hover:bg-muted flex items-center gap-2 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          {busy ? 'Uploading...' : 'Choose file'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />
        {url && <img src={url} alt="logo" className="h-10 rounded border bg-white" />}
      </div>
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
      {url && (
        <p className="text-xs text-muted-foreground mt-2 font-mono break-all">{url}</p>
      )}
    </div>
  );
}
