/** Parse YYYY-MM-DD from common news URL patterns, or null if unknown. */
export function dateFromUrl(url) {
  try {
    const path = new URL(url).pathname;

    // ChinaDaily: /a/202605/28/WS....html
    const cd = path.match(/\/a\/(\d{4})(\d{2})\/(\d{2})\//);
    if (cd) return `${cd[1]}-${cd[2]}-${cd[3]}`;

    // Xinhua: /20260530/<hex>/c.html
    const xh = path.match(/\/(\d{4})(\d{2})(\d{2})\/[a-f0-9]+\/c\.html/i);
    if (xh) return `${xh[1]}-${xh[2]}-${xh[3]}`;

    // Generic: /2026/05/31/...
    const gen = path.match(/\/(\d{4})\/(\d{2})\/(\d{2})\//);
    if (gen) return `${gen[1]}-${gen[2]}-${gen[3]}`;

    return null;
  } catch {
    return null;
  }
}

export function parseItemDate(item) {
  const raw = item.pubDate ?? item.pubdate ?? item.published ?? item.updated ?? item.isoDate;
  if (!raw) return null;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function isWithinMaxAge(dateStr, maxAgeDays) {
  if (!dateStr || maxAgeDays == null) return true;
  const cutoff = Date.now() - maxAgeDays * 86400_000;
  const t = new Date(`${dateStr}T12:00:00Z`).getTime();
  return t >= cutoff;
}

export function toDateString(d) {
  return d.toISOString().slice(0, 10);
}
