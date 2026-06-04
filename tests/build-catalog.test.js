import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeArticleFile } from '../scripts/lib/article.js';
import { buildCatalog, selectWithSourceCap } from '../scripts/build-catalog.js';

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'cat-'));
  await mkdir(join(root, 'articles'));
  return root;
}

test('buildCatalog produces catalog.json with all articles', async () => {
  const root = await setup();
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-first', title: 'First', source: 'bbc.com',
    url: 'https://bbc.com/1', date: '2026-05-25', topics: ['world'], type: 'full-text',
  }, 'Body one two three four five six seven eight nine ten eleven twelve.');
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-24-second', title: 'Second', source: 'theguardian.com',
    url: 'https://theguardian.com/2', date: '2026-05-24', topics: ['tech'], type: 'full-text',
  }, 'Body two three four five six seven eight nine ten eleven twelve thirteen.');

  const catalog = await buildCatalog(root);
  assert.equal(catalog.v, 1);
  assert.equal(catalog.articles.length, 2);
  const raw = JSON.parse(await readFile(join(root, 'catalog.json'), 'utf8'));
  assert.equal(raw.articles.length, 2);
  await rm(root, { recursive: true });
});

test('buildCatalog writes newest articles first in latest.md', async () => {
  const root = await setup();
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-24-older', title: 'Older Article', source: 'bbc.com',
    url: 'https://bbc.com/older', date: '2026-05-24', topics: ['world'], type: 'full-text',
  }, 'Body.');
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-newer', title: 'Newer Article', source: 'bbc.com',
    url: 'https://bbc.com/newer', date: '2026-05-25', topics: ['world'], type: 'full-text',
  }, 'Body.');

  await buildCatalog(root);
  const latest = await readFile(join(root, 'latest.md'), 'utf8');
  assert.ok(latest.indexOf('Newer Article') < latest.indexOf('Older Article'));
  await rm(root, { recursive: true });
});

test('buildCatalog caps articles per source per day in latest.md', async () => {
  const root = await setup();
  for (let i = 0; i < 4; i++) {
    await writeArticleFile(join(root, 'articles'), {
      id: `2026-05-25-bbc-${i}`, title: `BBC ${i}`, source: 'bbc.com',
      url: `https://bbc.com/${i}`, date: '2026-05-25', topics: ['world'], type: 'full-text',
    }, 'Body text long enough for full text.');
  }
  await buildCatalog(root);
  const latest = await readFile(join(root, 'latest.md'), 'utf8');
  const lines = latest.split('\n').filter(l => l.startsWith('- ['));
  assert.equal(lines.length, 2);
  await rm(root, { recursive: true });
});

test('buildCatalog writes DIGEST.md with inline full text', async () => {
  const root = await setup();
  const body = 'Digest body text that is long enough to appear in the daily reading digest output file.';
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-digest', title: 'Digest Article', source: 'techcrunch.com',
    url: 'https://techcrunch.com/d', date: '2026-05-25', topics: ['AI'], type: 'full-text',
  }, body);

  await buildCatalog(root);
  const digest = await readFile(join(root, 'DIGEST.md'), 'utf8');
  assert.ok(digest.includes('# Daily Reading Digest'));
  assert.ok(digest.includes('Digest Article'));
  assert.ok(digest.includes(body));
  await rm(root, { recursive: true });
});

test('selectWithSourceCap limits total articles per source when maxPerSourceTotal set', () => {
  const articles = [
    { id: '1', date: '2026-05-31', source: 'gov.uk', type: 'full-text' },
    { id: '2', date: '2026-05-30', source: 'gov.uk', type: 'full-text' },
    { id: '3', date: '2026-05-29', source: 'gov.uk', type: 'full-text' },
    { id: '4', date: '2026-05-31', source: 'news.un.org', type: 'full-text' },
  ];
  const picked = selectWithSourceCap(articles, { limit: 8, maxPerSourcePerDay: 99, maxPerSourceTotal: 2 });
  assert.equal(picked.filter(a => a.source === 'gov.uk').length, 2);
  assert.equal(picked.length, 3);
});

test('selectWithSourceCap prefers full-text only when requested', async () => {
  const articles = [
    { id: '1', date: '2026-05-25', source: 'a.com', type: 'link-only' },
    { id: '2', date: '2026-05-25', source: 'b.com', type: 'full-text' },
  ];
  const picked = selectWithSourceCap(articles, { limit: 5, fullTextOnly: true });
  assert.equal(picked.length, 1);
  assert.equal(picked[0].type, 'full-text');
});

test('buildCatalog ignores digest-*.md archive files in articles dir', async () => {
  const root = await setup();
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-article', title: 'Real Article', source: 'gov.uk',
    url: 'https://gov.uk/1', date: '2026-05-25', topics: ['UK'], type: 'full-text',
  }, 'Body content here.');
  // Place a digest archive file that should be skipped
  const { writeFile } = await import('node:fs/promises');
  await writeFile(join(root, 'articles', 'digest-2026-05-25.md'), '# Daily Reading Digest\nUpdated: 2026-05-25\n', 'utf8');

  const catalog = await buildCatalog(root);
  assert.equal(catalog.articles.length, 1);
  assert.equal(catalog.articles[0].id, '2026-05-25-article');
  await rm(root, { recursive: true });
});

test('buildCatalog handles empty articles directory', async () => {
  const root = await setup();
  const catalog = await buildCatalog(root);
  assert.equal(catalog.articles.length, 0);
  const digest = await readFile(join(root, 'DIGEST.md'), 'utf8');
  assert.ok(digest.includes('No full-text articles'));
  await rm(root, { recursive: true });
});
