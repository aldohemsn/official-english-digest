import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadSeenFile, saveSeenFile, markSeen } from './lib/seen-urls.js';
import { fetchRSS } from './sources/rss.js';
import { fetchNewsAPI } from './sources/newsapi.js';
import { fetchScraped } from './sources/scraper.js';

export async function runFetch(config, { apiKey = '', rootDir, fetchFn, _sources } = {}) {
  const seenPath = join(rootDir, '.seen-urls.json');
  const articlesDir = join(rootDir, 'articles');
  const seenUrls = await loadSeenFile(seenPath);
  const opts = fetchFn ? { fetchFn } : {};

  const rssSource = _sources?.rss ?? ((feeds, days, seen, dir, o) =>
    fetchRSS(feeds, days, seen, dir, { ...o, maxPerFeed: config.rss?.maxPerFeed ?? Infinity }));
  const newsSource = _sources?.newsapi ?? ((cfg, key, seen, dir, o) => fetchNewsAPI(cfg, key, seen, dir, o));
  const scrapeSource = _sources?.scrape ?? ((cfg, seen, dir, o) => fetchScraped(cfg, seen, dir, o));

  let rssResults = [], newsResults = [], scrapeResults = [];

  try { rssResults = await rssSource(config.rss.feeds, config.rss.maxAgeDays, seenUrls, articlesDir, opts); }
  catch (e) { console.error('RSS failed:', e.message); }

  try {
    if (apiKey && config.newsapi?.topics?.length) {
      newsResults = await newsSource(config.newsapi, apiKey, seenUrls, articlesDir, opts);
    }
  } catch (e) { console.error('NewsAPI failed:', e.message); }

  try {
    if (config.scrape?.targets?.length || (Array.isArray(config.scrape) && config.scrape.length)) {
      scrapeResults = await scrapeSource(config.scrape, seenUrls, articlesDir, opts);
    }
  } catch (e) { console.error('Scrape failed:', e.message); }

  if (_sources) {
    for (const r of [...rssResults, ...newsResults, ...scrapeResults]) {
      if (r.url) markSeen(seenUrls, r.url);
    }
  }

  await saveSeenFile(seenPath, seenUrls);

  const total = rssResults.length + newsResults.length + scrapeResults.length;
  return { total, bySource: { rss: rssResults.length, newsapi: newsResults.length, scrape: scrapeResults.length } };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rootDir = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  const config = JSON.parse(await readFile(join(rootDir, 'config', 'sources.json'), 'utf8'));
  const result = await runFetch(config, { apiKey: process.env.NEWSAPI_KEY ?? '', rootDir });
  console.log(`Fetched ${result.total} (RSS:${result.bySource.rss} News:${result.bySource.newsapi} Scrape:${result.bySource.scrape})`);
}
