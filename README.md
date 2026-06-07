# Official English Digest

A daily **full-text** reading list from authoritative official English sources — for English coaching with Claude, ChatGPT, Gemini, Grok, or any LLM.

**Production:** https://official-english-digest.vercel.app

## Daily email (primary)

Every day at **06:00 Beijing time** (UTC 22:00), a Vercel Cron job:

1. Fetches new articles from official sources
2. Builds `DIGEST.md` (8 full-text articles)
3. Emails HTML digest to `DIGEST_TO_EMAIL` via SMTP (163-compatible; same pattern as [KoodoWeb](https://github.com/aldohemsn/KoodoWeb))

Email is the **sole production delivery channel** — nothing is written back to Git or persisted on Vercel after each run.

Manual trigger (fetch may take 1–3 minutes):

```bash
curl -sS --max-time 600 -H "Authorization: Bearer $CRON_SECRET" \
  "https://official-english-digest.vercel.app/api/cron/daily-digest"
```

Success: `{"ok":true,"subject":"Official English Digest · YYYY-MM-DD",...}`

## Quick start (any LLM, local file)

1. Open **[DIGEST.md](DIGEST.md)** — 8 recent articles with **full body text inline** (~30 KB)
2. Upload it to your AI project's knowledge files, or paste it into a new chat
3. Say: `Pick one article from the digest and start an English coaching session`

## Sources

Official English publications from four authoritative outlets:

| Region | Outlet | Method |
|--------|--------|--------|
| China | [State Council](https://english.www.gov.cn/news) (english.www.gov.cn) | Scrape news index + Readability |
| United States | [White House Releases](https://www.whitehouse.gov/releases/) | Scrape releases index + Readability |
| United Kingdom | [GOV.UK news](https://www.gov.uk/search/news-and-communications) | Official Atom feed + Readability |
| United Nations | [UN News](https://news.un.org/en/news) | Official RSS + Readability |

All articles are stored as **full text** in `articles/`. Only sources with reliable body extraction are included.

## Repo layout

| Path | Purpose |
|------|---------|
| **`DIGEST.md`** | LLM entry — 8 articles, full text inline |
| `latest.md` | Headlines index, last 30 articles (diverse sources) |
| `catalog.json` | Machine-readable index of all articles |
| `articles/` | Full-text Markdown + YAML frontmatter |
| `config/sources.json` | RSS feeds and scrape targets |
| `api/cron/daily-digest.ts` | Vercel Cron handler: fetch → build → email |
| `api/lib/prepareWorkDir.ts` | Copies bundle to `/tmp` (Vercel read-only FS) |
| `api/lib/sendDigestSmtp.ts` | SMTP delivery (nodemailer) |
| `vercel.json` | Cron schedule + 300s function timeout |

## Running locally

```bash
npm ci
npm run fetch    # pull new articles (RSS + scrape)
npm run build    # regenerate catalog, latest.md, DIGEST.md
npm test
npm run typecheck
```

One-time cleanup of stale or deprecated-source articles:

```bash
node scripts/purge-bad-articles.js
```

## Vercel deploy

Requires **Vercel Pro** (Cron Jobs + 300s function timeout).

### 1. Link and deploy

```bash
npm i -g vercel
vercel login
vercel link
vercel deploy --prod
```

### 2. Environment variables (Production)

Set in **Project → Settings → Environment Variables**, then **Redeploy**:

| Variable | Required | Purpose |
|----------|----------|---------|
| `CRON_SECRET` | yes | Cron / manual trigger auth (`openssl rand -hex 24`) |
| `GITHUB_TOKEN` | yes | PAT with `repo` (Contents write) scope — commits digest archive |
| `GITHUB_REPO` | yes | `owner/repo`, e.g. `aldohemsn/official-english-digest` |
| `GITHUB_BRANCH` | no | Branch to commit to (default `main`) |
| `DIGEST_SMTP_USER` | yes | SMTP login (e.g. 163 mailbox) |
| `DIGEST_SMTP_PASS` | yes | 163 **client auth code** (not web login password) |
| `DIGEST_TO_EMAIL` | yes | Recipient email |
| `DIGEST_FROM_EMAIL` | no | Sender (defaults to SMTP user; 163 requires match) |
| `DIGEST_SMTP_HOST` | no | Default `smtp.163.com` |
| `DIGEST_SMTP_PORT` | no | Default `465` |
| `DIGEST_SMTP_SECURE` | no | Default `true` (SMTPS) |

Template: [scripts/env.digest.example](scripts/env.digest.example)

Optional CLI helper (writes env + deploys + triggers once):

```bash
cp scripts/env.digest.example scripts/.env.digest.local
# fill values
bash scripts/configure-vercel-digest-env.sh
```

### Serverless notes

Vercel functions have a **read-only** filesystem. The cron handler copies `articles/` and `.seen-urls.json` from the deployment bundle into `/tmp` before fetch/build. Writes are discarded when the function exits; only the email is delivered.

## English coach prompts

See the [English coach spec](https://github.com/aldohemsn/grok-audio/blob/main/docs/superpowers/specs/2026-05-25-grok-english-coach-prompt.md) for session instructions (Claude, Grok, platform-agnostic blocks).
