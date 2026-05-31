import { convert } from 'html-to-text';
import { marked } from 'marked';

function htmlToPlainEmailBody(html: string): string {
  return convert(html, {
    wordwrap: false,
    selectors: [
      { selector: 'a', options: { hideLinkHrefIfSameAsText: true } },
      { selector: 'img', format: 'skip' },
    ],
  }).trim();
}

marked.setOptions({ gfm: true, breaks: true });

function stripUnsafeHtml(html: string): string {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, '')
    .replace(/<style\b[\s\S]*?<\/style>/gi, '')
    .replace(/\s(on\w+|javascript:)\s*=/gi, ' data-blocked=');
}

async function mdToHtmlFragment(md: string): Promise<string> {
  const src = (md || '').trim() || '<p>(No content.)</p>';
  const out = await marked.parse(src, { async: true });
  return stripUnsafeHtml(String(out));
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export async function buildSimpleDigestBodies(
  title: string,
  plain: string
): Promise<{ html: string; text: string }> {
  const inner = await mdToHtmlFragment(plain.replace(/\n/g, '\n\n'));
  const html = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; line-height: 1.65; color: #1a1a1a; max-width: 42rem; margin: 0 auto; padding: 1rem 1.1rem 2rem; font-size: 15px; }
  h1 { font-size: 1.15rem; font-weight: 600; margin: 0 0 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #e5e5e5; }
  h2 { font-size: 1.05rem; font-weight: 600; margin: 1.35rem 0 0.55rem; }
  p { margin: 0.45em 0; }
  ul, ol { margin: 0.45em 0 0.55em 1.2em; }
  blockquote { margin: 0.6em 0; padding: 0.35em 0.75em; border-left: 3px solid #c8c8c8; background: #f7f7f7; }
  code { font-family: ui-monospace, Menlo, Consolas, monospace; font-size: 0.92em; background: #f0f0f0; padding: 0.08em 0.28em; border-radius: 3px; }
  hr { border: none; border-top: 1px solid #e5e5e5; margin: 1.5rem 0; }
</style>
</head>
<body><h1>${escapeHtml(title)}</h1><div>${inner}</div></body></html>`;
  const text = htmlToPlainEmailBody(html);
  return { html, text };
}
