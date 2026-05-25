import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet } from '../../scripts/lib/seen-urls.js';
import { fetchRSS } from '../../scripts/sources/rss.js';

const RECENT = new Date().toUTCString();
const OLD = new Date(Date.now() - 4 * 86400_000).toUTCString();

const RSS_XML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Feed</title>
  <item><title>Recent Article</title><link>https://example.com/recent</link><pubDate>${RECENT}</pubDate></item>
  <item><title>Old Article</title><link>https://example.com/old</link><pubDate>${OLD}</pubDate></item>
</channel></rss>`;

const ARTICLE_HTML = `<!DOCTYPE html><html><body><article>
  <h1>Recent Article</h1>
  <p>This is a sufficiently long article body that readability or fallback extraction can capture and store as full text content for the article.</p>
</article></body></html>`;

test('fetchRSS writes only recent articles', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml')
      ? { ok: true, text: async () => RSS_XML }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Recent Article');
  assert.equal(results[0].url, 'https://example.com/recent');
  const files = await readdir(dir);
  assert.equal(files.length, 1);
  await rm(dir, { recursive: true });
});

test('fetchRSS skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet(['https://example.com/recent']);
  const mockFetch = async () => ({ ok: true, text: async () => RSS_XML });

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchRSS falls back to link-only if article fetch fails', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml')
      ? { ok: true, text: async () => RSS_XML }
      : { ok: false, text: async () => '' };

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].type, 'link-only');
  await rm(dir, { recursive: true });
});
