# grok-articles

A daily-refreshed reading list for English coaching sessions with Grok.

## Connecting to Grok (one-time)

1. Grok Settings → Connectors → GitHub → authorize → select this repo
2. Done — Grok can browse your reading list during any conversation

## Using in a session

Start with the "With Connector Active" prompt from the [English coach doc](https://github.com/aldohe/grok-audio/blob/main/docs/superpowers/specs/2026-05-25-grok-english-coach-prompt.md), then try:

- `Pick an article from my reading list and let's discuss it`
- `Find a recent AI article from my reading list`
- `What's new in my reading list this week?`

## Repo layout

| Path | Purpose |
|---|---|
| `catalog.json` | Machine-readable index — Grok reads this first |
| `latest.md` | Last 30 articles, newest first |
| `links.md` | Link-only entries |
| `articles/` | Full-text articles as Markdown + YAML frontmatter |
| `config/sources.json` | RSS feeds, NewsAPI topics, scrape targets |

## Running locally

```bash
npm install
NEWSAPI_KEY=your_key npm run fetch
npm run build
npm test
```

## NewsAPI key setup

Get a free key at [newsapi.org](https://newsapi.org), then add it as a GitHub Actions secret named `NEWSAPI_KEY` (repo Settings → Secrets → Actions → New repository secret).
