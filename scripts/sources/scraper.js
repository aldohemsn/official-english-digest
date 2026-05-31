import * as cheerio from 'cheerio';
import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';
import { dateFromUrl, isWithinMaxAge } from '../lib/dates.js';
import { extractArticle } from '../lib/extract.js';

const ADAPTERS = {
  'chinadaily.com.cn': {
    listLinks($, indexUrl) {
      const links = [];
      const seen = new Set();
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href) return;
        const resolved = resolveChinaDailyUrl(href, indexUrl);
        if (!resolved || !/\/a\/\d{6}\/\d{2}\/WS[a-f0-9]+\.html/i.test(resolved)) return;
        if (seen.has(resolved)) return;
        seen.add(resolved);
        const title = $(el).text().trim();
        links.push({ href: resolved, title: title || null });
      });
      return links;
    },
  },
  'english.news.cn': {
    listLinks($, indexUrl) {
      const links = [];
      const seen = new Set();
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href) return;
        const resolved = resolveXinhuaUrl(href, indexUrl);
        if (!resolved || !/\/\d{8}\/[a-f0-9]+\/c\.html/i.test(resolved)) return;
        if (seen.has(resolved)) return;
        seen.add(resolved);
        const title = $(el).text().trim();
        links.push({ href: resolved, title: title || null });
      });
      return links;
    },
  },
};

function resolveChinaDailyUrl(href, indexUrl) {
  try {
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('http')) return href;
    return new URL(href, indexUrl).href;
  } catch {
    return null;
  }
}

function resolveXinhuaUrl(href, indexUrl) {
  try {
    if (href.startsWith('http')) return href;
    return new URL(href, indexUrl).href;
  } catch {
    return null;
  }
}

function hostOf(url) {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return 'unknown'; }
}

export async function fetchScraped(
  scrapeConfig,
  seenUrls,
  outDir,
  { fetchFn = fetch } = {},
) {
  const targets = Array.isArray(scrapeConfig) ? scrapeConfig : (scrapeConfig?.targets ?? []);
  const maxPerSource = scrapeConfig?.maxPerSource ?? Infinity;
  const maxAgeDays = scrapeConfig?.maxAgeDays ?? 2;
  const results = [];

  for (const target of targets) {
    const adapter = ADAPTERS[target.domain];
    if (!adapter) continue;

    let indexHtml;
    try {
      const res = await fetchFn(target.indexUrl);
      if (!res.ok) continue;
      indexHtml = await res.text();
    } catch { continue; }

    const links = adapter.listLinks(cheerio.load(indexHtml), target.indexUrl);
    let sourceCount = 0;

    for (const { href, title } of links) {
      if (sourceCount >= maxPerSource) break;

      const url = href;
      if (isSeen(seenUrls, url)) continue;

      const date = dateFromUrl(url);
      if (!date) continue;
      if (!isWithinMaxAge(date, maxAgeDays)) continue;

      const { title: extractedTitle, body } = await extractArticle(url, fetchFn);
      if (!body) continue;

      const finalTitle = extractedTitle || title || 'Untitled';
      const meta = {
        id: `${date}-${slugify(finalTitle).slice(0, 50)}`,
        title: finalTitle,
        source: hostOf(url),
        url,
        date,
        topics: target.topics ?? [],
        type: 'full-text',
      };
      const written = await writeArticleFile(outDir, meta, body);
      markSeen(seenUrls, url);
      results.push(written);
      sourceCount++;
    }
  }
  return results;
}
