import { NextResponse } from 'next/server';
import { getCloudflareContext } from '@opennextjs/cloudflare';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { key, contentType, base64 } = body;

    if (!key || !base64) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate it's an image
    if (!contentType || !contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files allowed' }, { status: 400 });
    }

    // Decode base64
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Get R2 binding
    const { env } = getCloudflareContext();
    const r2 = (env as any).UPLOADS;
    if (!r2) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    // Upload to R2
    await r2.put(key, bytes, {
      httpMetadata: { contentType },
    });

    // Build public URL using the R2 public bucket URL pattern
    // Cloudflare R2 public access via custom domain or r2.dev
    const accountId = '86ec491771aab8fb614bb2eea8f48f66';
    const url = `https://pub-${accountId}.r2.dev/${key}`;

    return NextResponse.json({ url, key });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Upload failed' }, { status: 500 });
  }
}
