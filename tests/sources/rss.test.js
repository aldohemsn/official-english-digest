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
  <item><title>Recent Article</title><link>https://example.com/2026/05/30/recent</link><pubDate>${RECENT}</pubDate></item>
  <item><title>Old Article</title><link>https://example.com/2026/05/20/old</link><pubDate>${OLD}</pubDate></item>
  <item><title>No Date Article</title><link>https://example.com/nodate</link></item>
</channel></rss>`;

const ARTICLE_HTML = `<!DOCTYPE html><html><body><article>
  <h1>Recent Article</h1>
  <p>This is a sufficiently long article body that readability or fallback extraction can capture and store as full text content for the article.</p>
</article></body></html>`;

test('fetchRSS writes only recent full-text articles', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml')
      ? { ok: true, text: async () => RSS_XML }
      : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch },
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'Recent Article');
  assert.equal(results[0].type, 'full-text');
  const files = await readdir(dir);
  assert.equal(files.length, 1);
  await rm(dir, { recursive: true });
});

test('fetchRSS skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet(['https://example.com/2026/05/30/recent']);
  const mockFetch = async () => ({ ok: true, text: async () => RSS_XML });

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch },
  );

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchRSS skips items without extractable body', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml')
      ? { ok: true, text: async () => RSS_XML }
      : { ok: false, text: async () => '' };

  const results = await fetchRSS(
    [{ url: 'https://example.com/feed.xml', topics: ['test'] }],
    2, seen, dir, { fetchFn: mockFetch },
  );

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchRSS uses URL date when pubDate missing', async () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Feed</title>
  <item><title>URL Dated</title><link>https://example.com/2026/05/31/story</link></item>
</channel></rss>`;
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml') ? { ok: true, text: async () => xml } : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchRSS([{ url: 'https://example.com/f.xml', topics: ['t'] }], 2, seen, dir, { fetchFn: mockFetch });
  assert.equal(results.length, 1);
  assert.equal(results[0].date, '2026-05-31');
  await rm(dir, { recursive: true });
});

test('fetchRSS respects maxPerFeed', async () => {
  const items = [28, 29, 30].map(d =>
    `<item><title>Item ${d}</title><link>https://example.com/2026/05/${d}/a</link><pubDate>${RECENT}</pubDate></item>`,
  ).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>Feed</title>${items}</channel></rss>`;
  const dir = await mkdtemp(join(tmpdir(), 'rss-'));
  const seen = createSeenSet([]);
  const mockFetch = async (url) =>
    url.endsWith('.xml') ? { ok: true, text: async () => xml } : { ok: true, text: async () => ARTICLE_HTML };

  const results = await fetchRSS(
    [{ url: 'https://example.com/f.xml', topics: ['t'] }],
    2, seen, dir, { fetchFn: mockFetch, maxPerFeed: 2 },
  );
  assert.equal(results.length, 2);
  await rm(dir, { recursive: true });
});
