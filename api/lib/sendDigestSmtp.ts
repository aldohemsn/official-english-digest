import type { VercelRequest } from '@vercel/node';
import nodemailer from 'nodemailer';

export function authorizeCron(req: VercelRequest): boolean {
  const secret = (process.env.CRON_SECRET || '').trim();
  if (!secret) return false;
  const auth = (req.headers.authorization || '').trim();
  return auth === `Bearer ${secret}`;
}

export async function sendDigestSmtp(params: {
  subject: string;
  text: string;
  html?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const host = (process.env.DIGEST_SMTP_HOST || 'smtp.163.com').trim();
  const portRaw = (process.env.DIGEST_SMTP_PORT || '465').trim();
  const port = Number.parseInt(portRaw, 10);
  const secure = (process.env.DIGEST_SMTP_SECURE || 'true').trim().toLowerCase() !== 'false';
  const user = (process.env.DIGEST_SMTP_USER || '').trim();
  const pass = (process.env.DIGEST_SMTP_PASS || '').trim();
  const to = (process.env.DIGEST_TO_EMAIL || '').trim();
  const from = (process.env.DIGEST_FROM_EMAIL || user).trim();

  if (!user || !pass || !to || !from) {
    return {
      ok: false,
      error:
        'Missing DIGEST_SMTP_USER, DIGEST_SMTP_PASS, DIGEST_TO_EMAIL, or From (set DIGEST_FROM_EMAIL or use SMTP user).',
    };
  }
  if (!Number.isFinite(port) || port < 1 || port > 65535) {
    return { ok: false, error: 'Invalid DIGEST_SMTP_PORT' };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    connectionTimeout: 15_000,
    socketTimeout: 25_000,
    tls: { rejectUnauthorized: true },
  });

  try {
    const htmlStr = params.html != null ? String(params.html) : '';
    const hasHtml = htmlStr.trim().length > 0;
    const multipartAlt =
      (process.env.DIGEST_SMTP_MULTIPART_ALTERNATIVE || '').trim().toLowerCase() === 'true';

    const mailOptions: Parameters<typeof transporter.sendMail>[0] = {
      from,
      to,
      subject: params.subject,
      ...(hasHtml && !multipartAlt
        ? { html: htmlStr }
        : hasHtml
          ? { text: params.text, html: htmlStr }
          : { text: params.text }),
    };
    await transporter.sendMail(mailOptions);
    return { ok: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
