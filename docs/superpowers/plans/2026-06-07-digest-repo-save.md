# Digest Repo Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After each successful digest email, commit `articles/digest-YYYY-MM-DD.md` to the GitHub repository via the GitHub REST API; if the commit fails, the cron handler returns a 502 error.

**Architecture:** A new `api/lib/commitDigestToGitHub.ts` module handles all GitHub API interaction (GET to fetch existing SHA + PUT to create/update the file). `api/cron/daily-digest.ts` calls this module after a successful email send, removing the existing best-effort `writeFile` block. Missing `GITHUB_TOKEN`/`GITHUB_REPO` env vars cause the handler to fail fast at startup.

**Tech Stack:** Node.js 24 `fetch` (built-in), GitHub REST API v3 (`/repos/{owner}/{repo}/contents/...`), Node.js `node:test` with `--experimental-strip-types` for TypeScript tests.

---

## File Map

| Action | Path | Responsibility |
|---|---|---|
| Create | `api/lib/commitDigestToGitHub.ts` | GitHub API GET+PUT, returns `{ ok }` |
| Create | `tests/lib/commitDigestToGitHub.test.ts` | Unit tests with mocked `fetch` |
| Modify | `api/cron/daily-digest.ts` | Call commit after email; guard env vars |
| Modify | `package.json` | Add `--experimental-strip-types` to test script |
| Modify | `scripts/env.digest.example` | Document new GITHUB_* env vars |

---

### Task 1: Add `--experimental-strip-types` to test script

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Update test script**

In `package.json`, change the `"test"` script from:
```json
"test": "node --test 'tests/**/*.test.js'"
```
to:
```json
"test": "node --experimental-strip-types --test 'tests/**/*.test.js' 'tests/**/*.test.ts'"
```

- [ ] **Step 2: Verify existing tests still produce the same output**

Run:
```bash
npm test 2>&1 | grep -c "✖"
```
Expected: same count of failures as before (tests fail due to missing node_modules, not our change).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: enable TypeScript test files via experimental-strip-types"
```

---

### Task 2: Write failing tests for `commitDigestToGitHub`

**Files:**
- Create: `tests/lib/commitDigestToGitHub.test.ts`

- [ ] **Step 1: Create the test file**

Create `tests/lib/commitDigestToGitHub.test.ts`:

```typescript
import { test, mock, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { commitDigestToGitHub } from '../../api/lib/commitDigestToGitHub.ts';

const CONTENT = '# Digest\n\nHello world.';
const DATE = '2026-06-07';
const BASE64_CONTENT = Buffer.from(CONTENT, 'utf8').toString('base64');

function makeResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

beforeEach(() => {
  process.env.GITHUB_TOKEN = 'ghp_test';
  process.env.GITHUB_REPO = 'owner/repo';
  delete process.env.GITHUB_BRANCH;
});

afterEach(() => {
  mock.restoreAll();
  delete process.env.GITHUB_TOKEN;
  delete process.env.GITHUB_REPO;
  delete process.env.GITHUB_BRANCH;
});

test('returns error when GITHUB_TOKEN is missing', async () => {
  delete process.env.GITHUB_TOKEN;
  const result = await commitDigestToGitHub(DATE, CONTENT);
  assert.equal(result.ok, false);
  assert.match((result as { ok: false; error: string }).error, /GITHUB_TOKEN/);
});

test('returns error when GITHUB_REPO is missing', async () => {
  delete process.env.GITHUB_REPO;
  const result = await commitDigestToGitHub(DATE, CONTENT);
  assert.equal(result.ok, false);
  assert.match((result as { ok: false; error: string }).error, /GITHUB_REPO/);
});

test('creates new file when it does not exist (GET 404 → PUT 201)', async () => {
  const calls: { url: string; options?: RequestInit }[] = [];
  mock.method(globalThis, 'fetch', async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    if (!options?.method || options.method === 'GET') {
      return makeResponse(404, { message: 'Not Found' });
    }
    return makeResponse(201, { content: { sha: 'abc123' } });
  });

  const result = await commitDigestToGitHub(DATE, CONTENT);
  assert.deepEqual(result, { ok: true });

  const putCall = calls.find(c => c.options?.method === 'PUT');
  assert.ok(putCall, 'PUT call should be made');
  const body = JSON.parse(putCall!.options!.body as string);
  assert.equal(body.content, BASE64_CONTENT);
  assert.equal(body.message, `chore: archive digest ${DATE}`);
  assert.equal(body.branch, 'main');
  assert.equal(body.sha, undefined, 'no sha for new file');
});

test('updates existing file with its SHA (GET 200 → PUT 200)', async () => {
  const EXISTING_SHA = 'sha_existing_123';
  const calls: { url: string; options?: RequestInit }[] = [];
  mock.method(globalThis, 'fetch', async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    if (!options?.method || options.method === 'GET') {
      return makeResponse(200, { sha: EXISTING_SHA, content: 'old content' });
    }
    return makeResponse(200, { content: { sha: 'new_sha' } });
  });

  const result = await commitDigestToGitHub(DATE, CONTENT);
  assert.deepEqual(result, { ok: true });

  const putCall = calls.find(c => c.options?.method === 'PUT');
  assert.ok(putCall, 'PUT call should be made');
  const body = JSON.parse(putCall!.options!.body as string);
  assert.equal(body.sha, EXISTING_SHA, 'sha must be sent for existing file');
});

test('uses GITHUB_BRANCH env var when set', async () => {
  process.env.GITHUB_BRANCH = 'develop';
  const calls: { url: string; options?: RequestInit }[] = [];
  mock.method(globalThis, 'fetch', async (url: string, options?: RequestInit) => {
    calls.push({ url, options });
    if (!options?.method || options.method === 'GET') return makeResponse(404, {});
    return makeResponse(201, { content: { sha: 'abc' } });
  });

  await commitDigestToGitHub(DATE, CONTENT);
  const putCall = calls.find(c => c.options?.method === 'PUT');
  const body = JSON.parse(putCall!.options!.body as string);
  assert.equal(body.branch, 'develop');
});

test('returns error when GitHub PUT returns non-2xx', async () => {
  mock.method(globalThis, 'fetch', async (_url: string, options?: RequestInit) => {
    if (!options?.method || options.method === 'GET') return makeResponse(404, {});
    return makeResponse(422, { message: 'Validation Failed' });
  });

  const result = await commitDigestToGitHub(DATE, CONTENT);
  assert.equal(result.ok, false);
  assert.match((result as { ok: false; error: string }).error, /422/);
});
```

- [ ] **Step 2: Run tests to verify they fail (module not found)**

```bash
npm test -- 2>&1 | grep -A 3 "commitDigestToGitHub"
```
Expected: error about missing module `commitDigestToGitHub.ts`.

---

### Task 3: Implement `api/lib/commitDigestToGitHub.ts`

**Files:**
- Create: `api/lib/commitDigestToGitHub.ts`

- [ ] **Step 1: Create the implementation**

Create `api/lib/commitDigestToGitHub.ts`:

```typescript
export async function commitDigestToGitHub(
  date: string,
  content: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = (process.env.GITHUB_TOKEN ?? '').trim();
  const repo = (process.env.GITHUB_REPO ?? '').trim();
  const branch = (process.env.GITHUB_BRANCH ?? 'main').trim();

  if (!token) return { ok: false, error: 'GITHUB_TOKEN env var is required' };
  if (!repo) return { ok: false, error: 'GITHUB_REPO env var is required' };

  const path = `articles/digest-${date}.md`;
  const apiBase = `https://api.github.com/repos/${repo}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };

  // GET to check if file exists and retrieve its SHA for update
  let existingSha: string | undefined;
  try {
    const getRes = await fetch(apiBase, { method: 'GET', headers });
    if (getRes.ok) {
      const data = await getRes.json() as { sha?: string };
      existingSha = data.sha;
    }
  } catch {
    // network error on GET — proceed without SHA; PUT will create the file
  }

  const body: Record<string, string> = {
    message: `chore: archive digest ${date}`,
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch,
  };
  if (existingSha) body.sha = existingSha;

  let putRes: Response;
  try {
    putRes = await fetch(apiBase, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: `github fetch error: ${msg}` };
  }

  if (putRes.status === 200 || putRes.status === 201) return { ok: true };

  const errText = await putRes.text().catch(() => '');
  return { ok: false, error: `github: ${putRes.status} ${errText}` };
}
```

- [ ] **Step 2: Run the new tests**

```bash
npm ci && npm test -- 2>&1 | grep -E "(commitDigestToGitHub|✓|✖)" | head -20
```
Expected: all 6 `commitDigestToGitHub` tests pass (✓).

- [ ] **Step 3: Commit**

```bash
git add api/lib/commitDigestToGitHub.ts tests/lib/commitDigestToGitHub.test.ts
git commit -m "feat: add commitDigestToGitHub module with tests"
```

---

### Task 4: Update `daily-digest.ts`

**Files:**
- Modify: `api/cron/daily-digest.ts`

- [ ] **Step 1: Add import and env guard, remove old writeFile block, add commit call**

Replace the contents of `api/cron/daily-digest.ts` with:

```typescript
/**
 * Daily Official English Digest Cron (Vercel Serverless).
 *
 * Env: CRON_SECRET, DIGEST_SMTP_*, DIGEST_TO_EMAIL, GITHUB_TOKEN, GITHUB_REPO — see scripts/env.digest.example
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { buildSimpleDigestBodies } from '../lib/digestFormatHtml.js';
import { isReadOnlyDeployRoot, prepareWorkDir } from '../lib/prepareWorkDir.js';
import { authorizeCron, sendDigestSmtp } from '../lib/sendDigestSmtp.js';
import { commitDigestToGitHub } from '../lib/commitDigestToGitHub.js';
import { runFetch } from '../../scripts/fetch.js';
import { buildCatalog } from '../../scripts/build-catalog.js';

function digestSubject(markdown: string): string {
  const updatedLine = markdown.split('\n').find((l) => l.startsWith('Updated:'));
  const dateMatch = updatedLine?.match(/(\d{4}-\d{2}-\d{2})/);
  const day = dateMatch?.[1] ?? new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(Date.now());
  return `Official English Digest · ${day}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!authorizeCron(req)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO) {
    return res.status(500).json({ error: 'GITHUB_TOKEN and GITHUB_REPO env vars are required' });
  }

  const deployRoot = process.cwd();
  const rootDir = isReadOnlyDeployRoot() ? await prepareWorkDir(deployRoot) : deployRoot;

  try {
    const config = JSON.parse(
      await readFile(join(deployRoot, 'config', 'sources.json'), 'utf8')
    );
    const fetchResult = await runFetch(config, {
      apiKey: process.env.NEWSAPI_KEY ?? '',
      rootDir,
    } as { apiKey?: string; rootDir: string });
    await buildCatalog(rootDir);

    const digestMarkdown = await readFile(join(rootDir, 'DIGEST.md'), 'utf8');
    const subject = digestSubject(digestMarkdown);
    const { html, text } = await buildSimpleDigestBodies(subject, digestMarkdown);

    const sent = await sendDigestSmtp({ subject, text, html });
    if (sent.ok === false) {
      return res.status(502).json({ error: sent.error, fetched: fetchResult.total });
    }

    const dayMatch = subject.match(/(\d{4}-\d{2}-\d{2})/);
    const day = dayMatch?.[1];
    if (!day) {
      return res.status(500).json({ ok: false, error: 'could not parse date from digest subject' });
    }

    const committed = await commitDigestToGitHub(day, digestMarkdown);
    if (committed.ok === false) {
      return res.status(502).json({ ok: false, error: committed.error, fetched: fetchResult.total });
    }

    return res.status(200).json({
      ok: true,
      subject,
      fetched: fetchResult.total,
      bySource: fetchResult.bySource,
      committed: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    const failSubject = `Official English Digest [failed]`;
    const failBody = `Daily digest generation failed.\n\nError: ${msg}\n\nCheck Vercel function logs and DIGEST_SMTP_* env vars.`;
    try {
      const { html, text } = await buildSimpleDigestBodies(failSubject, failBody);
      await sendDigestSmtp({ subject: failSubject, text, html });
    } catch {
      /* notification send is best-effort */
    }
    return res.status(500).json({ ok: false, error: msg });
  }
}
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```
Expected: no TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add api/cron/daily-digest.ts
git commit -m "feat: commit digest archive to GitHub after each successful send"
```

---

### Task 5: Update env example and README

**Files:**
- Modify: `scripts/env.digest.example`
- Modify: `README.md`

- [ ] **Step 1: Add GITHUB_* vars to env example**

In `scripts/env.digest.example`, append after the `CRON_SECRET` line:

```bash
# --- GitHub (commit digest archive to repo) ---
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_REPO=owner/official-english-digest
# Optional: branch to commit to (default: main)
# GITHUB_BRANCH=main
```

- [ ] **Step 2: Update the env vars table in README.md**

In `README.md`, add three rows to the environment variables table (after `CRON_SECRET`):

```markdown
| `GITHUB_TOKEN` | yes | PAT with `repo` (Contents write) scope — commits digest archive |
| `GITHUB_REPO` | yes | `owner/repo`, e.g. `aldohemsn/official-english-digest` |
| `GITHUB_BRANCH` | no | Branch to commit to (default `main`) |
```

- [ ] **Step 3: Commit**

```bash
git add scripts/env.digest.example README.md
git commit -m "docs: document GITHUB_TOKEN, GITHUB_REPO, GITHUB_BRANCH env vars"
```
