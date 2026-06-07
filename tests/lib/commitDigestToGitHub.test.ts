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
