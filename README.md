# Official English Digest

A daily-refreshed **full-text** reading list from authoritative official English sources — for English coaching with Claude, ChatGPT, Gemini, Grok, or any LLM. No connectors or live URL fetching required at chat time.

## Quick start (any LLM)

1. Open **[DIGEST.md](DIGEST.md)** — 8 recent articles with **full body text inline** (~30 KB)
2. Upload it to your AI project's knowledge files, or paste it into a new chat
3. Say: `Pick one article from the digest and start an English coaching session`

That's it. The LLM reads everything from the file — no GitHub connector, no paywalls, no guessing.

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
| **`DIGEST.md`** | **Primary LLM entry** — 8 articles, full text inline |
| `latest.md` | Headlines index, last 30 articles (diverse sources) |
| `catalog.json` | Machine-readable index of all articles |
| `articles/` | Full-text Markdown + YAML frontmatter |
| `config/sources.json` | RSS feeds and scrape targets |

## Running locally

```bash
npm ci
npm run fetch    # pull new articles (RSS + scrape)
npm run build    # regenerate catalog, latest.md, DIGEST.md
npm test
```

One-time cleanup of stale or deprecated-source articles:

```bash
node scripts/purge-bad-articles.js
```

## GitHub Actions

Runs daily at 06:00 UTC: `fetch` → `build` → commit. No API keys required.

## English coach prompts

See the [English coach spec](https://github.com/aldohe/grok-audio/blob/main/docs/superpowers/specs/2026-05-25-grok-english-coach-prompt.md) for session instructions (platform-agnostic block included).
