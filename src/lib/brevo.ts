/**
 * Brevo (sendinblue) API wrapper.
 * Used for transactional email and contact list management.
 *
 * docs: https://developers.brevo.com/reference
 */

const BREVO_API = 'https://api.brevo.com/v3';

function headers() {
  const key = process.env.BREVO_API_KEY;
  if (!key) throw new Error('BREVO_API_KEY not set');
  return {
    'api-key': key,
    'content-type': 'application/json',
    'accept': 'application/json',
  };
}

export type BrevoSendEmailParams = {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  params?: Record<string, unknown>;
};

export async function sendEmail(p: BrevoSendEmailParams): Promise<{ messageId: string }> {
  const sender = {
    email: process.env.BREVO_SENDER_EMAIL || 'hello@example.com',
    name: process.env.BREVO_SENDER_NAME || 'M&A Platform',
  };

  const body: Record<string, unknown> = {
    sender,
    to: p.to,
    subject: p.subject,
  };

  if (p.templateId) {
    body.templateId = p.templateId;
    if (p.params) body.params = p.params;
  } else {
    body.htmlContent = p.htmlContent;
    if (p.textContent) body.textContent = p.textContent;
  }

  const res = await fetch(`${BREVO_API}/smtp/email`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Brevo send failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{ messageId: string }>;
}

export async function upsertContact(email: string, attributes?: Record<string, unknown>, listIds?: number[]): Promise<{ id: number }> {
  const res = await fetch(`${BREVO_API}/contacts`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      email,
      attributes: attributes || {},
      listIds: listIds || [],
      updateEnabled: true,
    }),
  });

  if (!res.ok && res.status !== 204) {
    const text = await res.text();
    throw new Error(`Brevo contact upsert failed: ${res.status} ${text}`);
  }

  // 201 returns body, 204 doesn't
  if (res.status === 204) return { id: 0 };
  return res.json() as Promise<{ id: number }>;
}

export async function sendWelcomeEmail(email: string, fullName: string): Promise<void> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const html = `
<!doctype html>
<html>
<body style="margin:0;padding:40px 20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:540px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;border:1px solid #e5e5e5;">
    <h1 style="margin:0 0 16px;font-size:20px;color:#0a0a0a;letter-spacing:-0.01em;">Welcome to M&amp;A Platform</h1>
    <p style="margin:0 0 16px;color:#525252;line-height:1.6;font-size:15px;">Hi ${fullName},</p>
    <p style="margin:0 0 16px;color:#525252;line-height:1.6;font-size:15px;">
      You're in. Create your first workspace to start analyzing a deal. Connect QuickBooks or upload financial documents directly, and the platform handles normalization, anomaly detection, and reporting from there.
    </p>
    <a href="${siteUrl}" style="display:inline-block;margin:16px 0 8px;padding:10px 20px;background:#3D5A80;color:#fff;text-decoration:none;border-radius:6px;font-size:14px;font-weight:500;">Open the platform</a>
    <p style="margin:24px 0 0;color:#a3a3a3;font-size:13px;line-height:1.5;">
      Questions? Just reply to this email.
    </p>
  </div>
</body>
</html>
  `.trim();

  await sendEmail({
    to: [{ email, name: fullName }],
    subject: 'Welcome to M&A Platform',
    htmlContent: html,
  });
}
