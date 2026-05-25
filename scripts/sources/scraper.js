import * as cheerio from 'cheerio';
import { isSeen, markSeen } from '../lib/seen-urls.js';
import { writeArticleFile, slugify } from '../lib/article.js';

const ADAPTERS = {
  'chinadaily.com.cn': {
    listLinks($) {
      const links = [];
      $('h4 a, h3 a, .titleFontSize a').each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && title) links.push({ href, title });
      });
      return links;
    },
    extractArticle($) {
      return {
        title: $('#Title, h1').first().text().trim(),
        body: $('#Content, .article_content').first().text().trim(),
      };
    },
    resolveUrl(href, _indexUrl) {
      if (href.startsWith('http')) return href;
      return `https://www.chinadaily.com.cn${href}`;
    },
  },
};

export async function fetchScraped(targets, seenUrls, outDir, { fetchFn = fetch } = {}) {
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

    const links = adapter.listLinks(cheerio.load(indexHtml));

    for (const { href, title } of links) {
      const url = adapter.resolveUrl(href, target.indexUrl);
      if (isSeen(seenUrls, url)) continue;

      let body = '';
      let finalTitle = title;
      try {
        const res = await fetchFn(url);
        if (res.ok) {
          const extracted = adapter.extractArticle(cheerio.load(await res.text()));
          if (extracted.title) finalTitle = extracted.title;
          body = extracted.body;
        }
      } catch { /* link-only fallback */ }

      const date = new Date().toISOString().slice(0, 10);
      const meta = {
        id: `${date}-${slugify(finalTitle).slice(0, 50)}`,
        title: finalTitle,
        source: target.name,
        url,
        date,
        topics: target.topics ?? [],
        type: body.length > 50 ? 'full-text' : 'link-only',
      };
      const written = await writeArticleFile(outDir, meta, body);
      markSeen(seenUrls, url);
      results.push(written);
    }
  }
  return results;
}
