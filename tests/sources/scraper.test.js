import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet } from '../../scripts/lib/seen-urls.js';
import { fetchScraped } from '../../scripts/sources/scraper.js';

const INDEX_HTML = `<html><body>
  <a href="//www.chinadaily.com.cn/a/202605/30/WS1234567890abcdef.html">Test Story Title From ChinaDaily</a>
</body></html>`;

const ARTICLE_HTML = `<!DOCTYPE html><html><head><title>Test Story Title From ChinaDaily</title></head><body><article>
  <p>This is the article body text with enough content to be stored as a full text article entry for the reading digest and catalog builder.</p>
</article></body></html>`;

const SCRAPE_CONFIG = {
  maxAgeDays: 2,
  maxPerSource: 8,
  targets: [{
    name: 'ChinaDaily',
    domain: 'chinadaily.com.cn',
    indexUrl: 'https://www.chinadaily.com.cn/world',
    topics: ['China'],
  }],
};

test('fetchScraped writes full-text articles from ChinaDaily index', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('/world')
      ? { ok: true, text: async () => INDEX_HTML }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped(SCRAPE_CONFIG, seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 1);
  assert.equal(results[0].type, 'full-text');
  assert.equal(results[0].source, 'chinadaily.com.cn');
  assert.equal(results[0].date, '2026-05-30');
  const files = await readdir(dir);
  assert.equal(files.length, 1);
  await rm(dir, { recursive: true });
});

test('fetchScraped skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet(['https://www.chinadaily.com.cn/a/202605/30/WS1234567890abcdef.html']);
  const mockFetch = async () => ({ ok: true, text: async () => INDEX_HTML });

  const results = await fetchScraped(SCRAPE_CONFIG, seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchScraped respects maxPerSource', async () => {
  const index = `<html><body>
    <a href="//www.chinadaily.com.cn/a/202605/30/WS1111111111111111.html">One</a>
    <a href="//www.chinadaily.com.cn/a/202605/30/WS2222222222222222.html">Two</a>
    <a href="//www.chinadaily.com.cn/a/202605/30/WS3333333333333333.html">Three</a>
  </body></html>`;
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('/world') ? { ok: true, text: async () => index } : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped(
    { ...SCRAPE_CONFIG, maxPerSource: 2 },
    seen, dir, { fetchFn: mockFetch },
  );
  assert.equal(results.length, 2);
  await rm(dir, { recursive: true });
});
