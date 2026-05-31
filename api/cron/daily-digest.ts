/**
 * Daily Official English Digest Cron (Vercel Serverless).
 *
 * Env: CRON_SECRET, DIGEST_SMTP_*, DIGEST_TO_EMAIL — see scripts/env.digest.example
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSimpleDigestBodies } from '../lib/digestFormatHtml.js';
import { isReadOnlyDeployRoot, prepareWorkDir } from '../lib/prepareWorkDir.js';
import { authorizeCron, sendDigestSmtp } from '../lib/sendDigestSmtp.js';
import { runFetch } from '../../scripts/fetch.js';
import { buildCatalog } from '../../scripts/build-catalog.js';

function digestSubject(markdown: string): string {
  const updatedLine = markdown.split('\n').find((l) => l.startsWith('Updated:'));
  const dateMatch = updatedLine?.match(/(\d{4}-\d{2}-\d{2})/);
  const day = dateMatch?.[1] ?? new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(Date.now());
  return `Official English Digest · ${day}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!authorizeCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const deployRoot = process.cwd();
  const rootDir = isReadOnlyDeployRoot() ? await prepareWorkDir(deployRoot) : deployRoot;

  try {
    const config = JSON.parse(
      await readFile(join(deployRoot, 'config', 'sources.json'), 'utf8')
    );
    const fetchResult = await runFetch(config, {
      apiKey: process.env.NEWSAPI_KEY ?? '',
      rootDir,
    } as { apiKey?: string; rootDir: string });
    await buildCatalog(rootDir);

    const digestMarkdown = await readFile(join(rootDir, 'DIGEST.md'), 'utf8');
    const subject = digestSubject(digestMarkdown);
    const { html, text } = await buildSimpleDigestBodies(subject, digestMarkdown);

    const sent = await sendDigestSmtp({ subject, text, html });
    if (sent.ok === false) {
      return res.status(502).json({ error: sent.error, fetched: fetchResult.total });
    }

    return res.status(200).json({
      ok: true,
      subject,
      fetched: fetchResult.total,
      bySource: fetchResult.bySource,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const failSubject = `Official English Digest [failed]`;
    const failBody = `Daily digest generation failed.\n\nError: ${msg}\n\nCheck Vercel function logs and DIGEST_SMTP_* env vars.`;
    try {
      const { html, text } = await buildSimpleDigestBodies(failSubject, failBody);
      await sendDigestSmtp({ subject: failSubject, text, html });
    } catch {
      /* notification send is best-effort */
    }
    return res.status(500).json({ ok: false, error: msg });
  }
}
