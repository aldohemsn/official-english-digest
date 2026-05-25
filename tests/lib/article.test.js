import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { slugify, articleFilename, writeArticleFile, parseArticleFile } from '../../scripts/lib/article.js';

test('slugify produces lowercase kebab-case', () => {
  assert.equal(slugify("China's AI Race: What the Latest Data Shows"), 'chinas-ai-race-what-the-latest-data-shows');
});

test('slugify truncates at 60 chars', () => {
  assert.ok(slugify('a'.repeat(100)).length <= 60);
});

test('articleFilename formats date-slug', () => {
  assert.equal(articleFilename('2026-05-25', 'Hello World'), '2026-05-25-hello-world.md');
});

test('writeArticleFile writes markdown with frontmatter', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'art-'));
  const meta = { id: '2026-05-25-test', title: 'Test Article', source: 'Reuters',
    url: 'https://reuters.com/test', date: '2026-05-25', topics: ['AI'], type: 'full-text' };
  const result = await writeArticleFile(dir, meta, 'Article body text here.');
  assert.equal(result.file, 'articles/2026-05-25-test-article.md');
  const written = await readFile(join(dir, '2026-05-25-test-article.md'), 'utf8');
  assert.ok(written.startsWith('---\n'));
  assert.ok(written.includes('title: Test Article'));
  assert.ok(written.includes('Article body text here.'));
  await rm(dir, { recursive: true });
});

test('parseArticleFile returns meta and body', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'art-'));
  const meta = { id: '2026-05-25-test', title: 'Test', source: 'BBC',
    url: 'https://bbc.com/test', date: '2026-05-25', topics: ['world'], type: 'link-only' };
  await writeArticleFile(dir, meta, '');
  const parsed = await parseArticleFile(join(dir, '2026-05-25-test.md'));
  assert.equal(parsed.meta.title, 'Test');
  assert.deepEqual(parsed.meta.topics, ['world']);
  await rm(dir, { recursive: true });
});
