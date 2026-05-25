import RSSParser from 'rss-parser';
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';

const parser = new RSSParser();

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

async function extractBody(url, fetchFn) {
  try {
    const res = await fetchFn(url);
    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document.cloneNode(true));
    const parsed = reader.parse();
    if (parsed?.textContent?.trim().length > 100) return parsed.textContent.trim();
    // fallback: raw body text from original (unmodified) DOM
    const bodyText = dom.window.document.body?.textContent?.trim() ?? '';
    return bodyText.length > 100 ? bodyText : null;
  } catch {
    return null;
  }
}

export async function fetchRSS(feeds, maxAgeDays, seenUrls, outDir, { fetchFn = fetch } = {}) {
  const cutoff = Date.now() - maxAgeDays * 86400_000;
  const results = [];

  for (const feed of feeds) {
    let feedXml;
    try {
      const res = await fetchFn(feed.url);
      if (!res.ok) continue;
      feedXml = await res.text();
    } catch { continue; }

    let items = [];
    try {
      const parsed = await parser.parseString(feedXml);
      items = parsed.items ?? [];
    } catch { continue; }

    for (const item of items) {
      const url = item.link;
      if (!url || isSeen(seenUrls, url)) continue;
      const pub = item.pubDate ? new Date(item.pubDate) : null;
      if (pub && pub.getTime() < cutoff) continue;

      const date = (pub ?? new Date()).toISOString().slice(0, 10);
      const body = await extractBody(url, fetchFn);
      const meta = {
        id: `${date}-${slugify(item.title ?? 'untitled').slice(0, 50)}`,
        title: item.title ?? 'Untitled',
        source: hostOf(url),
        url,
        date,
        topics: feed.topics ?? [],
        type: body ? 'full-text' : 'link-only',
      };
      const written = await writeArticleFile(outDir, meta, body ?? '');
      markSeen(seenUrls, url);
      results.push(written);
    }
  }
  return results;
}
