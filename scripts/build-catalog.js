import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

const DIGEST_COUNT = 8;
const DIGEST_MAX_CHARS = 6000;
const LATEST_COUNT = 30;
const MAX_PER_SOURCE_PER_DAY = 2;

function compareArticles(a, b) {
  if (a.date !== b.date) return b.date.localeCompare(a.date);
  return b.id.localeCompare(a.id);
}

export function selectWithSourceCap(articles, { limit, maxPerSourcePerDay = MAX_PER_SOURCE_PER_DAY, fullTextOnly = false } = {}) {
  const sorted = [...articles].sort(compareArticles);
  const picked = [];
  const counts = new Map();

  for (const a of sorted) {
    if (fullTextOnly && a.type !== 'full-text') continue;
    const key = `${a.date}|${a.source}`;
    const n = counts.get(key) ?? 0;
    if (n >= maxPerSourcePerDay) continue;
    picked.push(a);
    counts.set(key, n + 1);
    if (picked.length >= limit) break;
  }
  return picked;
}

function latestMd(articles) {
  if (!articles.length) return '# Latest Articles\n\n_No articles yet._\n';
  const lines = ['# Latest Articles\n'];
  let lastDate = null;
  for (const a of articles) {
    if (a.date !== lastDate) { lines.push(`\n## ${a.date}\n`); lastDate = a.date; }
    lines.push(`- [${a.title}](${a.url}) — ${a.source} · ${a.topics.join(', ')}`);
  }
  return lines.join('\n') + '\n';
}

function linksMd(articles) {
  if (!articles.length) return '# Curated Links\n\n_No links yet._\n';
  const lines = ['# Curated Links\n'];
  let lastDate = null;
  for (const a of articles) {
    if (a.date !== lastDate) { lines.push(`\n## ${a.date}\n`); lastDate = a.date; }
    lines.push(`- [${a.title}](${a.url}) — ${a.source} · ${a.topics.join(', ')}`);
  }
  return lines.join('\n') + '\n';
}

function truncateBody(body, maxChars = DIGEST_MAX_CHARS) {
  const text = body.trim();
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trim()}…`;
}

export async function digestMd(articles, rootDir, updatedAt) {
  const picked = selectWithSourceCap(articles, {
    limit: DIGEST_COUNT,
    maxPerSourcePerDay: 2,
    fullTextOnly: true,
  });

  const lines = [
    '# Daily Reading Digest',
    `Updated: ${updatedAt}  ·  ${picked.length} articles, full text inline`,
    '',
  ];

  let n = 0;
  for (const a of picked) {
    n++;
    const raw = await readFile(join(rootDir, a.file), 'utf8');
    const { content } = matter(raw);
    lines.push('---', '');
    lines.push(`## ${n}. ${a.title}`);
    lines.push(`- Source: ${a.source} · Topics: ${a.topics.join(', ')} · Date: ${a.date}`);
    lines.push(`- URL (reference only): ${a.url}`, '');
    lines.push(truncateBody(content), '');
  }

  if (!picked.length) {
    lines.push('_No full-text articles available yet._', '');
  }

  return lines.join('\n');
}

export async function buildCatalog(rootDir) {
  const articlesDir = join(rootDir, 'articles');
  let files = [];
  try { files = await readdir(articlesDir); } catch { /* empty */ }

  const articles = [];
  for (const file of files.filter(f => f.endsWith('.md')).sort().reverse()) {
    const { data: meta } = matter(await readFile(join(articlesDir, file), 'utf8'));
    articles.push({
      id: meta.id, title: meta.title, source: meta.source, url: meta.url,
      date: meta.date, topics: meta.topics ?? [], file: `articles/${file}`, type: meta.type,
    });
  }

  const updatedAt = new Date().toISOString();
  const catalog = { v: 1, updated_at: updatedAt, articles };
  const latestArticles = selectWithSourceCap(articles, { limit: LATEST_COUNT });

  await writeFile(join(rootDir, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');
  await writeFile(join(rootDir, 'latest.md'), latestMd(latestArticles), 'utf8');
  await writeFile(join(rootDir, 'links.md'), linksMd(articles.filter(a => a.type === 'link-only')), 'utf8');
  await writeFile(join(rootDir, 'DIGEST.md'), await digestMd(articles, rootDir, updatedAt), 'utf8');
  return catalog;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rootDir = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  buildCatalog(rootDir)
    .then(c => console.log(`Catalog built: ${c.articles.length} articles`))
    .catch(e => { console.error(e); process.exit(1); });
}
