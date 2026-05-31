import * as cheerio from 'cheerio';
import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';
import { dateFromUrl, dateFromDatetime, parseListingDate, isWithinMaxAge } from '../lib/dates.js';
import { extractArticle } from '../lib/extract.js';

const GOV_CN_ARTICLE = /\/news\/\d{6}\/\d{2}\/content_WS[a-f0-9]+\.html/i;
const WHITEHOUSE_RELEASE = /\/releases\/\d{4}\/\d{2}\/[^/]+\/?$/i;

function resolveHref(href, indexUrl) {
  try {
    if (href.startsWith('//')) return `https:${href}`;
    if (href.startsWith('http')) return href;
    return new URL(href, indexUrl).href;
  } catch {
    return null;
  }
}

const ADAPTERS = {
  'english.www.gov.cn': {
    listLinks($, indexUrl) {
      const links = [];
      const seen = new Set();
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href) return;
        const resolved = resolveHref(href, indexUrl);
        if (!resolved || !GOV_CN_ARTICLE.test(resolved)) return;
        if (seen.has(resolved)) return;
        seen.add(resolved);
        const title = $(el).text().trim();
        links.push({ href: resolved, title: title || null, date: dateFromUrl(resolved) });
      });
      return links;
    },
  },
  'whitehouse.gov': {
    listLinks($, indexUrl) {
      const links = [];
      const seen = new Set();

      $('li.wp-block-post, article').each((_, block) => {
        const $block = $(block);
        const $a = $block.find('h2.wp-block-post-title a, .wp-block-post-title a').first();
        const href = $a.attr('href')?.trim();
        if (!href) return;
        const resolved = resolveHref(href, indexUrl);
        if (!resolved || !WHITEHOUSE_RELEASE.test(resolved.replace(/\/$/, ''))) return;
        if (resolved.includes('/releases/page/')) return;
        if (seen.has(resolved)) return;
        seen.add(resolved);

        const datetime = $block.find('time[datetime]').first().attr('datetime');
        const date = dateFromDatetime(datetime)
          ?? parseListingDate($block.find('time').first().text())
          ?? dateFromUrl(resolved);

        links.push({
          href: resolved,
          title: $a.text().trim() || null,
          date,
        });
      });

      if (links.length) return links;

      $('a[href]').each((_, el) => {
        const href = $(el).attr('href')?.trim();
        if (!href) return;
        const resolved = resolveHref(href, indexUrl);
        if (!resolved || !WHITEHOUSE_RELEASE.test(resolved.replace(/\/$/, ''))) return;
        if (resolved.includes('/releases/page/')) return;
        if (seen.has(resolved)) return;
        seen.add(resolved);
        links.push({
          href: resolved,
          title: $(el).text().trim() || null,
          date: dateFromUrl(resolved),
        });
      });

      return links;
    },
  },
};

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

    for (const { href, title, date: linkDate } of links) {
      if (sourceCount >= maxPerSource) break;

      const url = href;
      if (isSeen(seenUrls, url)) continue;

      const date = linkDate ?? dateFromUrl(url);
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
