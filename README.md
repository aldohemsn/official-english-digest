# grok-articles

A daily-refreshed **full-text** reading list for English coaching — works with Claude, ChatGPT, Gemini, Grok, or any LLM. No connectors or live URL fetching required at chat time.

## Quick start (any LLM)

1. Open **[DIGEST.md](DIGEST.md)** — 8 recent articles with **full body text inline** (~25 KB)
2. Upload it to your AI project's knowledge files, or paste it into a new chat
3. Say: `Pick one article from the digest and start an English coaching session`

That's it. The LLM reads everything from the file — no GitHub connector, no paywalls, no guessing.

## Sources

| Category | Outlets | Method |
|----------|---------|--------|
| Western media | BBC (world, business, tech), TechCrunch, The Guardian (world, US) | RSS + Readability |
| Chinese official media (English) | China Daily, Xinhua | Scrape current index pages + Readability |

All articles are stored as **full text** in `articles/`. Paywalled sources (NYT, Economist) are excluded because body extraction fails.

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

One-time cleanup of stale/paywall placeholder articles:

```bash
node scripts/purge-bad-articles.js
```

## GitHub Actions

Runs daily at 06:00 UTC: `fetch` → `build` → commit. No API keys required.

## English coach prompts

See the [English coach spec](https://github.com/aldohe/grok-audio/blob/main/docs/superpowers/specs/2026-05-25-grok-english-coach-prompt.md) for session instructions (platform-agnostic block included).
