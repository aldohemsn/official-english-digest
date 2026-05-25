import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet } from '../../scripts/lib/seen-urls.js';
import { fetchNewsAPI } from '../../scripts/sources/newsapi.js';

const API_RESPONSE = {
  status: 'ok',
  articles: [{
    title: 'AI Breakthrough Announced',
    url: 'https://techcrunch.com/ai-breakthrough',
    publishedAt: new Date().toISOString(),
    source: { name: 'TechCrunch' },
    content: 'Full article content here with enough text to qualify as full-text rather than link-only entry in our system.',
  }],
};

test('fetchNewsAPI writes articles', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'news-'));
  const seen = createSeenSet([]);
  const mockFetch = async () => ({ ok: true, json: async () => API_RESPONSE });

  const results = await fetchNewsAPI(
    { topics: ['AI'], language: 'en', pageSize: 10 },
    'test-key', seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].title, 'AI Breakthrough Announced');
  assert.equal(results[0].source, 'TechCrunch');
  const files = await readdir(dir);
  assert.equal(files.length, 1);
  await rm(dir, { recursive: true });
});

test('fetchNewsAPI skips seen URLs', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'news-'));
  const seen = createSeenSet(['https://techcrunch.com/ai-breakthrough']);
  const mockFetch = async () => ({ ok: true, json: async () => API_RESPONSE });

  const results = await fetchNewsAPI(
    { topics: ['AI'], language: 'en', pageSize: 10 },
    'test-key', seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});

test('fetchNewsAPI handles API error gracefully', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'news-'));
  const seen = createSeenSet([]);
  const mockFetch = async () => ({ ok: false, json: async () => ({}) });

  const results = await fetchNewsAPI(
    { topics: ['AI'], language: 'en', pageSize: 10 },
    'test-key', seen, dir, { fetchFn: mockFetch }
  );

  assert.equal(results.length, 0);
  await rm(dir, { recursive: true });
});
