import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runFetch } from '../scripts/fetch.js';

const EMPTY_CONFIG = {
  rss: { maxAgeDays: 2, maxPerFeed: 15, feeds: [] },
  scrape: { maxAgeDays: 2, maxPerSource: 8, targets: [] },
};

async function makeRoot() {
  const root = await mkdtemp(join(tmpdir(), 'fetch-'));
  await mkdir(join(root, 'articles'));
  await writeFile(join(root, '.seen-urls.json'), '[]', 'utf8');
  return root;
}

test('runFetch with empty config returns zero counts', async () => {
  const root = await makeRoot();
  const result = await runFetch(EMPTY_CONFIG, { apiKey: '', rootDir: root });
  assert.equal(result.total, 0);
  assert.deepEqual(result.bySource, { rss: 0, newsapi: 0, scrape: 0 });
  await rm(root, { recursive: true });
});

test('runFetch persists seen URLs via injectable sources', async () => {
  const root = await makeRoot();
  const mockSources = {
    rss: async () => [{ url: 'https://example.com/a', file: 'articles/a.md' }],
    newsapi: async () => [],
    scrape: async () => [],
  };

  await runFetch(EMPTY_CONFIG, { apiKey: '', rootDir: root, _sources: mockSources });

  const seen = JSON.parse(await readFile(join(root, '.seen-urls.json'), 'utf8'));
  assert.ok(seen.includes('https://example.com/a'));
  await rm(root, { recursive: true });
});
