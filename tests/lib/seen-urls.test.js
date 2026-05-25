import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createSeenSet, isSeen, markSeen, loadSeenFile, saveSeenFile } from '../../scripts/lib/seen-urls.js';

test('createSeenSet from empty array has size 0', () => {
  assert.equal(createSeenSet([]).size, 0);
});

test('isSeen returns false for unknown url', () => {
  assert.equal(isSeen(createSeenSet([]), 'https://a.com'), false);
});

test('markSeen then isSeen returns true', () => {
  const s = createSeenSet([]);
  markSeen(s, 'https://a.com');
  assert.equal(isSeen(s, 'https://a.com'), true);
});

test('loadSeenFile returns empty set if file missing', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'seen-'));
  const s = await loadSeenFile(join(dir, 'nope.json'));
  assert.equal(s.size, 0);
  await rm(dir, { recursive: true });
});

test('saveSeenFile then loadSeenFile round-trips', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'seen-'));
  const path = join(dir, '.seen-urls.json');
  const s = createSeenSet(['https://a.com', 'https://b.com']);
  await saveSeenFile(path, s);
  const loaded = await loadSeenFile(path);
  assert.equal(isSeen(loaded, 'https://a.com'), true);
  assert.equal(isSeen(loaded, 'https://c.com'), false);
  await rm(dir, { recursive: true });
});
