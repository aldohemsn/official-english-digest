import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { writeArticleFile } from '../scripts/lib/article.js';
import { buildCatalog } from '../scripts/build-catalog.js';

async function setup() {
  const root = await mkdtemp(join(tmpdir(), 'cat-'));
  await mkdir(join(root, 'articles'));
  return root;
}

test('buildCatalog produces catalog.json with all articles', async () => {
  const root = await setup();
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-first', title: 'First', source: 'BBC',
    url: 'https://bbc.com/1', date: '2026-05-25', topics: ['world'], type: 'full-text',
  }, 'Body.');
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-24-second', title: 'Second', source: 'Reuters',
    url: 'https://reuters.com/2', date: '2026-05-24', topics: ['tech'], type: 'link-only',
  }, '');

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
    id: '2026-05-24-older', title: 'Older Article', source: 'BBC',
    url: 'https://bbc.com/older', date: '2026-05-24', topics: ['world'], type: 'full-text',
  }, 'Body.');
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-newer', title: 'Newer Article', source: 'BBC',
    url: 'https://bbc.com/newer', date: '2026-05-25', topics: ['world'], type: 'full-text',
  }, 'Body.');

  await buildCatalog(root);
  const latest = await readFile(join(root, 'latest.md'), 'utf8');
  assert.ok(latest.indexOf('Newer Article') < latest.indexOf('Older Article'));
  await rm(root, { recursive: true });
});

test('buildCatalog writes links.md with link-only articles', async () => {
  const root = await setup();
  await writeArticleFile(join(root, 'articles'), {
    id: '2026-05-25-link', title: 'Link Only', source: 'Reuters',
    url: 'https://reuters.com/link', date: '2026-05-25', topics: ['tech'], type: 'link-only',
  }, '');

  await buildCatalog(root);
  const links = await readFile(join(root, 'links.md'), 'utf8');
  assert.ok(links.includes('Link Only'));
  assert.ok(links.includes('https://reuters.com/link'));
  await rm(root, { recursive: true });
});

test('buildCatalog handles empty articles directory', async () => {
  const root = await setup();
  const catalog = await buildCatalog(root);
  assert.equal(catalog.articles.length, 0);
  await rm(root, { recursive: true });
});
