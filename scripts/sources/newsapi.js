import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';

const BASE = 'https://newsapi.org/v2/everything';

export async function fetchNewsAPI(config, apiKey, seenUrls, outDir, { fetchFn = fetch } = {}) {
  const { topics, language = 'en', pageSize = 10 } = config;
  const results = [];

  for (const topic of topics) {
    let data;
    try {
      const url = `${BASE}?q=${encodeURIComponent(topic)}&language=${language}&pageSize=${pageSize}&sortBy=publishedAt&apiKey=${apiKey}`;
      const res = await fetchFn(url);
      if (!res.ok) continue;
      data = await res.json();
    } catch { continue; }

    if (data.status !== 'ok') continue;

    for (const item of data.articles ?? []) {
      if (!item.url || isSeen(seenUrls, item.url)) continue;
      const date = item.publishedAt?.slice(0, 10) ?? new Date().toISOString().slice(0, 10);
      const body = (item.content ?? '').replace(/\[\+\d+ chars\]$/, '').trim();
      const meta = {
        id: `${date}-${slugify(item.title ?? 'untitled').slice(0, 50)}`,
        title: item.title ?? 'Untitled',
        source: item.source?.name ?? 'Unknown',
        url: item.url,
        date,
        topics: [topic],
        type: body.length > 100 ? 'full-text' : 'link-only',
      };
      const written = await writeArticleFile(outDir, meta, body);
      markSeen(seenUrls, item.url);
      results.push(written);
    }
  }
  return results;
}
