import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return ''; }
}

function extractFromDom(url, html) {
  const dom = new JSDOM(html, { url });
  const doc = dom.window.document;

  if (hostOf(url) === 'english.www.gov.cn') {
    const artical = doc.querySelector('.Artical_Content, .mBody .Artical_Content');
    if (artical) {
      const title = doc.querySelector('h1')?.textContent?.trim()
        || doc.querySelector('title')?.textContent?.trim()
        || null;
      const body = artical.textContent?.trim() ?? '';
      if (body.length > 100) return { title, body };
    }
  }

  const reader = new Readability(doc.cloneNode(true));
  const parsed = reader.parse();
  const title = parsed?.title?.trim() || null;
  const body = parsed?.textContent?.trim() || null;
  if (body && body.length > 100) return { title, body };

  const fallback = doc.body?.textContent?.trim() ?? '';
  return { title, body: fallback.length > 100 ? fallback : null };
}

export async function extractBody(url, fetchFn = fetch) {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    const html = await res.text();
    return extractFromDom(url, html).body;
  } catch {
    return null;
  }
}

export async function extractArticle(url, fetchFn = fetch) {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return { title: null, body: null };
    const html = await res.text();
    return extractFromDom(url, html);
  } catch {
    return { title: null, body: null };
  }
}
