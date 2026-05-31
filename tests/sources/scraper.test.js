import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet } from '../../scripts/lib/seen-urls.js';
import { fetchScraped } from '../../scripts/sources/scraper.js';

const GOV_CN_INDEX = `<html><body>
  <a href="//english.www.gov.cn/news/202605/30/content_WS1234567890abcdef.html">Canada and China strengthen ties</a>
</body></html>`;

const WHITEHOUSE_INDEX = `<html><body><ul>
  <li class="wp-block-post">
    <h2 class="wp-block-post-title"><a href="https://www.whitehouse.gov/releases/2026/05/example-release/">Example Release Title</a></h2>
    <time datetime="2026-05-30T14:01:52-04:00">May 30, 2026</time>
  </li>
</ul></body></html>`;

const ARTICLE_HTML = `<!DOCTYPE html><html><head><title>Example Release Title</title></head><body><article>
  <p>This is the article body text with enough content to be stored as a full text article entry for the reading digest and catalog builder.</p>
</article></body></html>`;

const GOV_CN_CONFIG = {
  maxAgeDays: 2,
  maxPerSource: 8,
  targets: [{
    name: 'StateCouncil',
    domain: 'english.www.gov.cn',
    indexUrl: 'https://english.www.gov.cn/news',
    topics: ['China', 'government'],
  }],
};

const WHITEHOUSE_CONFIG = {
  maxAgeDays: 2,
  maxPerSource: 8,
  targets: [{
    name: 'WhiteHouse',
    domain: 'whitehouse.gov',
    indexUrl: 'https://www.whitehouse.gov/releases/',
    topics: ['US', 'government'],
  }],
};

test('fetchScraped writes full-text articles from gov.cn index', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('/news') && !url.includes('content_WS')
      ? { ok: true, text: async () => GOV_CN_INDEX }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped(GOV_CN_CONFIG, seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 1);
  assert.equal(results[0].type, 'full-text');
  assert.equal(results[0].source, 'english.www.gov.cn');
  assert.equal(results[0].date, '2026-05-30');
  await rm(dir, { recursive: true });
});

test('fetchScraped writes full-text from White House releases with index date', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('/releases/') && !url.includes('example-release')
      ? { ok: true, text: async () => WHITEHOUSE_INDEX }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped(WHITEHOUSE_CONFIG, seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 1);
  assert.equal(results[0].source, 'whitehouse.gov');
  assert.equal(results[0].date, '2026-05-30');
  assert.match(results[0].url, /\/releases\/2026\/05\//);
  await rm(dir, { recursive: true });
});

test('fetchScraped skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet(['https://english.www.gov.cn/news/202605/30/content_WS1234567890abcdef.html']);
  const mockFetch = async () => ({ ok: true, text: async () => GOV_CN_INDEX });

  const results = await fetchScraped(GOV_CN_CONFIG, seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchScraped respects maxPerSource', async () => {
  const index = `<html><body>
    <a href="//english.www.gov.cn/news/202605/30/content_WS1111111111111111.html">One</a>
    <a href="//english.www.gov.cn/news/202605/30/content_WS2222222222222222.html">Two</a>
    <a href="//english.www.gov.cn/news/202605/30/content_WS3333333333333333.html">Three</a>
  </body></html>`;
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('/news') && !url.includes('content_WS')
      ? { ok: true, text: async () => index }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped(
    { ...GOV_CN_CONFIG, maxPerSource: 2 },
    seen, dir, { fetchFn: mockFetch },
  );
  assert.equal(results.length, 2);
  await rm(dir, { recursive: true });
});
