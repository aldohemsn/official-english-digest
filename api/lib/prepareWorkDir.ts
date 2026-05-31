import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { constants as fsConstants } from 'node:fs';
import { access } from 'node:fs/promises';

const WORK_DIR = join('/tmp', 'official-english-digest-work');

/** Writable workspace for Vercel (read-only deployment bundle). */
export async function prepareWorkDir(deployRoot: string): Promise<string> {
  await mkdir(join(WORK_DIR, 'articles'), { recursive: true });

  try {
    await cp(join(deployRoot, 'articles'), join(WORK_DIR, 'articles'), { recursive: true });
  } catch {
    /* no articles in bundle yet */
  }

  try {
    await access(join(deployRoot, '.seen-urls.json'), fsConstants.R_OK);
    await cp(join(deployRoot, '.seen-urls.json'), join(WORK_DIR, '.seen-urls.json'));
  } catch {
    /* start with empty seen set */
  }

  return WORK_DIR;
}

export function isReadOnlyDeployRoot(): boolean {
  return Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
}
