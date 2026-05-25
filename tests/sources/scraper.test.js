import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet } from '../../scripts/lib/seen-urls.js';
import { fetchScraped } from '../../scripts/sources/scraper.js';

const INDEX_HTML = `<html><body>
  <h4><a href="/a/202605/25/WS123.html">Test Story Title From ChinaDaily</a></h4>
</body></html>`;

const ARTICLE_HTML = `<html><body>
  <h1 id="Title">Test Story Title From ChinaDaily</h1>
  <div id="Content">This is the article body text with enough content to be stored as a full text article entry.</div>
</body></html>`;

const TARGET = {
  name: 'ChinaDaily',
  domain: 'chinadaily.com.cn',
  indexUrl: 'https://www.chinadaily.com.cn/a/trending.html',
  topics: ['China'],
};

test('fetchScraped writes articles from ChinaDaily', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.includes('trending')
      ? { ok: true, text: async () => INDEX_HTML }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchScraped([TARGET], seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 1);
  assert.equal(results[0].source, 'ChinaDaily');
  const files = await readdir(dir);
  assert.equal(files.length, 1);
  await rm(dir, { recursive: true });
});

test('fetchScraped skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'scrape-'));
  const seen = createSeenSet(['https://www.chinadaily.com.cn/a/202605/25/WS123.html']);
  const mockFetch = async () => ({ ok: true, text: async () => INDEX_HTML });

  const results = await fetchScraped([TARGET], seen, dir, { fetchFn: mockFetch });

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});
