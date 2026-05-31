import { readdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { loadSeenFile, saveSeenFile } from './lib/seen-urls.js';
import { buildCatalog } from './build-catalog.js';

const OLD_URL = /\/(201[0-9]|202[0-4])\//;

function isStaleUrl(url) {
  const s = String(url ?? '');
  if (OLD_URL.test(s)) return true;

  const cd = s.match(/\/a\/(\d{4})(\d{2})\/(\d{2})\//);
  if (cd && parseInt(cd[1], 10) < 2025) return true;

  const compact = s.match(/\/(\d{4})(\d{2})(\d{2})\//);
  if (compact && parseInt(compact[1], 10) < 2025) return true;

  return false;
}

function shouldPurge(meta) {
  if (meta.type === 'link-only') return true;
  if (isStaleUrl(meta.url)) return true;
  return false;
}

export async function purgeBadArticles(rootDir) {
  const articlesDir = join(rootDir, 'articles');
  const seenPath = join(rootDir, '.seen-urls.json');
  const seen = await loadSeenFile(seenPath);
  const removedUrls = [];

  let files;
  try {
    files = await readdir(articlesDir);
  } catch {
    return { removed: 0, removedUrls: [] };
  }

  let removed = 0;
  for (const file of files.filter(f => f.endsWith('.md'))) {
    const path = join(articlesDir, file);
    const { data: meta } = matter(await readFile(path, 'utf8'));
    if (!shouldPurge(meta)) continue;
    await unlink(path);
    removed++;
    if (meta.url) {
      seen.delete(meta.url);
      removedUrls.push(meta.url);
    }
  }

  await saveSeenFile(seenPath, seen);
  return { removed, removedUrls };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rootDir = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  const { removed } = await purgeBadArticles(rootDir);
  const catalog = await buildCatalog(rootDir);
  console.log(`Purged ${removed} articles. Catalog rebuilt: ${catalog.articles.length} articles.`);
}
