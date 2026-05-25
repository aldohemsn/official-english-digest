import { readFile, writeFile } from 'node:fs/promises';

export function createSeenSet(urls) { return new Set(urls); }
export function isSeen(set, url) { return set.has(url); }
export function markSeen(set, url) { set.add(url); }

export async function loadSeenFile(filePath) {
  try {
    return createSeenSet(JSON.parse(await readFile(filePath, 'utf8')));
  } catch {
    return createSeenSet([]);
  }
}

export async function saveSeenFile(filePath, set) {
  await writeFile(filePath, JSON.stringify([...set], null, 2), 'utf8');
}
