import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

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

  const catalog = { v: 1, updated_at: new Date().toISOString(), articles };
  await writeFile(join(rootDir, 'catalog.json'), JSON.stringify(catalog, null, 2), 'utf8');
  await writeFile(join(rootDir, 'latest.md'), latestMd(articles.slice(0, 30)), 'utf8');
  await writeFile(join(rootDir, 'links.md'), linksMd(articles.filter(a => a.type === 'link-only')), 'utf8');
  return catalog;
}

// CLI entry point
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const rootDir = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
  buildCatalog(rootDir)
    .then(c => console.log(`Catalog built: ${c.articles.length} articles`))
    .catch(e => { console.error(e); process.exit(1); });
}
