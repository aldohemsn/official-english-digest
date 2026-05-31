import RSSParser from 'rss-parser';
import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';
import { dateFromUrl, parseItemDate, isWithinMaxAge, toDateString } from '../lib/dates.js';
import { extractBody } from '../lib/extract.js';

const parser = new RSSParser({
  customFields: {
    item: [
      ['pubdate', 'pubdate'],
      ['published', 'published'],
      ['updated', 'updated'],
    ],
  },
});

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

function resolveItemUrl(item) {
  const link = item.link;
  const guid = typeof item.guid === 'string' ? item.guid : null;
  if (link?.includes('news.un.org/feed/view') && guid?.includes('/en/story/')) {
    return guid;
  }
  return link;
}

function resolveItemDate(item, url) {
  const pub = parseItemDate(item);
  if (pub) return toDateString(pub);
  return dateFromUrl(url);
}

export async function fetchRSS(feeds, maxAgeDays, seenUrls, outDir, { fetchFn = fetch, maxPerFeed = Infinity } = {}) {
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

    let feedCount = 0;
    for (const item of items) {
      if (feedCount >= maxPerFeed) break;

      const url = resolveItemUrl(item);
      if (!url || isSeen(seenUrls, url)) continue;

      const date = resolveItemDate(item, url);
      if (!date) continue;
      if (!isWithinMaxAge(date, maxAgeDays)) continue;

      const body = await extractBody(url, fetchFn);
      if (!body) continue;

      const meta = {
        id: `${date}-${slugify(item.title ?? 'untitled').slice(0, 50)}`,
        title: item.title ?? 'Untitled',
        source: hostOf(url),
        url,
        date,
        topics: feed.topics ?? [],
        type: 'full-text',
      };
      const written = await writeArticleFile(outDir, meta, body);
      markSeen(seenUrls, url);
      results.push(written);
      feedCount++;
    }
  }
  return results;
}
