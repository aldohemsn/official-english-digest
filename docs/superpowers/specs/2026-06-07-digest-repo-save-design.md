# Design: Save Daily Digest Archive to GitHub Repo

**Date:** 2026-06-07  
**Status:** Approved

## Goal

After each successful digest send, commit `articles/digest-YYYY-MM-DD.md` to the GitHub repository from within the Vercel serverless function. If the commit fails, the cron handler returns an error response (hard requirement, not best-effort).

## Scope

- Persist only the daily archive file (`articles/digest-YYYY-MM-DD.md`).
- `DIGEST.md`, `latest.md`, and `catalog.json` are **not** written back to the repo.

## Architecture

### New file: `api/lib/commitDigestToGitHub.ts`

Self-contained module responsible for all GitHub API interaction.

**Interface:**

```ts
export async function commitDigestToGitHub(
  date: string,    // "YYYY-MM-DD"
  content: string, // markdown content of the digest
): Promise<{ ok: true } | { ok: false; error: string }>
```

**Behaviour:**

1. Reads `GITHUB_TOKEN`, `GITHUB_REPO`, and `GITHUB_BRANCH` (defaults to `main`) from env.
2. Calls `GET /repos/{owner}/{repo}/contents/articles/digest-{date}.md` to check if the file already exists and retrieve its SHA (needed for idempotent updates).
3. Calls `PUT /repos/{owner}/{repo}/contents/articles/digest-{date}.md` with the base64-encoded content, commit message `chore: archive digest {date}`, and the SHA if the file already exists.
4. Returns `{ ok: true }` on HTTP 200/201, or `{ ok: false, error: "<status> <body>" }` on any other status.

### Modified file: `api/cron/daily-digest.ts`

**Changes:**

- Import `commitDigestToGitHub` from `../lib/commitDigestToGitHub.js`.
- Remove the existing best-effort `writeFile` block (lines 59–66) — superseded by the GitHub commit.
- After `sendDigestSmtp` succeeds, call `commitDigestToGitHub(day, digestMarkdown)`.
- On failure, return `502` with `{ ok: false, error: "github: <message>", fetched: ... }`.
- On success, include `committed: true` in the `200` response.

**Guard at handler entry:** if `GITHUB_TOKEN` or `GITHUB_REPO` are absent, return `500` immediately with `{ error: "GITHUB_TOKEN and GITHUB_REPO env vars are required" }`.

## Data Flow

```
fetch articles
  → build catalog
  → read DIGEST.md
  → send email          (failure → 502)
  → commit archive      (failure → 502)   ← NEW
  → return 200 { ok: true, committed: true, ... }
```

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `GITHUB_TOKEN` | yes | — | PAT with `repo` (Contents write) scope |
| `GITHUB_REPO` | yes | — | `owner/repo`, e.g. `aldohemsn/official-english-digest` |
| `GITHUB_BRANCH` | no | `main` | Branch to commit to |

## Error Handling

| Scenario | Behaviour |
|---|---|
| `GITHUB_TOKEN` or `GITHUB_REPO` missing | `500` at handler entry |
| GitHub API returns non-2xx | `502` with `{ ok: false, error: "github: ..." }` |
| File already exists (re-run) | GET fetches SHA → PUT succeeds idempotently |
| Email send fails | Existing `502` path; GitHub commit is never attempted |

## Testing

- Unit test for `commitDigestToGitHub`: mock `fetch`, assert correct PUT payload (base64 content, SHA on update, commit message).
- Unit test for the guard: missing env vars → `{ ok: false, error: ... }`.
- Existing cron handler tests remain unchanged.
