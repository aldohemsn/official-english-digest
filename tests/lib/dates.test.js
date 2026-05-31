import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  dateFromUrl,
  parseListingDate,
  dateFromDatetime,
  parseItemDate,
  isWithinMaxAge,
} from '../../scripts/lib/dates.js';

test('dateFromUrl parses State Council gov.cn URLs', () => {
  assert.equal(
    dateFromUrl('https://english.www.gov.cn/news/202605/31/content_WS6a1b926fc6d00ca5f9a0b580.html'),
    '2026-05-31',
  );
});

test('dateFromUrl parses ChinaDaily URLs', () => {
  assert.equal(
    dateFromUrl('https://www.chinadaily.com.cn/a/202605/28/WS6a184373a310d6866eb4b472.html'),
    '2026-05-28',
  );
});

test('dateFromUrl parses Xinhua URLs', () => {
  assert.equal(
    dateFromUrl('https://english.news.cn/20260530/3343323208f24d7ea29b396ca4c94459/c.html'),
    '2026-05-30',
  );
});

test('dateFromUrl parses generic YYYY/MM/DD URLs', () => {
  assert.equal(
    dateFromUrl('https://www.gov.uk/government/news/example-2026-05-31'),
    null,
  );
  assert.equal(
    dateFromUrl('https://news.un.org/en/story/2026/05/1167606'),
    null,
  );
  assert.equal(
    dateFromUrl('https://www.whitehouse.gov/releases/2026/05/example/'),
    null,
  );
});

test('dateFromUrl returns null for unknown patterns', () => {
  assert.equal(dateFromUrl('https://example.com/story'), null);
});

test('parseListingDate parses slash and named dates', () => {
  assert.equal(parseListingDate('2026/05/31'), '2026-05-31');
  assert.equal(parseListingDate('May 27, 2026'), '2026-05-27');
  assert.equal(parseListingDate('invalid'), null);
});

test('dateFromDatetime extracts YYYY-MM-DD', () => {
  assert.equal(dateFromDatetime('2026-05-27T14:01:52-04:00'), '2026-05-27');
});

test('parseItemDate reads pubdate custom field', () => {
  const d = parseItemDate({ pubdate: 'Sat, 30 May 2026 20:55:06 -0400' });
  assert.ok(d instanceof Date);
  assert.equal(d.getFullYear(), 2026);
});

test('isWithinMaxAge respects cutoff', () => {
  const today = new Date().toISOString().slice(0, 10);
  assert.equal(isWithinMaxAge(today, 2), true);
  assert.equal(isWithinMaxAge('2017-12-12', 2), false);
});
