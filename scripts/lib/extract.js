import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';

export async function extractBody(url, fetchFn = fetch) {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document.cloneNode(true));
    const parsed = reader.parse();
    if (parsed?.textContent?.trim().length > 100) return parsed.textContent.trim();
    const bodyText = dom.window.document.body?.textContent?.trim() ?? '';
    return bodyText.length > 100 ? bodyText : null;
  } catch {
    return null;
  }
}

export async function extractArticle(url, fetchFn = fetch) {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return { title: null, body: null };
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document.cloneNode(true));
    const parsed = reader.parse();
    const title = parsed?.title?.trim() || null;
    const body = parsed?.textContent?.trim() || null;
    if (body && body.length > 100) return { title, body };
    const fallback = dom.window.document.body?.textContent?.trim() ?? '';
    return { title, body: fallback.length > 100 ? fallback : null };
  } catch {
    return { title: null, body: null };
  }
}
