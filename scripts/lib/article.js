import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';

export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);
}

export function articleFilename(date, title) {
  return `${date}-${slugify(title)}.md`;
}

export async function writeArticleFile(outDir, meta, body) {
  const filename = articleFilename(meta.date, meta.title);
  const content = matter.stringify(body ?? '', meta);
  await writeFile(join(outDir, filename), content, 'utf8');
  return { ...meta, file: `articles/${filename}` };
}

export async function parseArticleFile(filePath) {
  const raw = await readFile(filePath, 'utf8');
  const { data: meta, content: body } = matter(raw);
  return { meta, body: body.trim() };
}
