const MONTHS = {
  january: '01', february: '02', march: '03', april: '04',
  may: '05', june: '06', july: '07', august: '08',
  september: '09', october: '10', november: '11', december: '12',
};

/** Parse YYYY-MM-DD from common news URL patterns, or null if unknown. */
export function dateFromUrl(url) {
  try {
    const path = new URL(url).pathname;

    // State Council EN: /news/202605/31/content_WS....html
    const govCn = path.match(/\/news\/(\d{4})(\d{2})\/(\d{2})\//);
    if (govCn) return `${govCn[1]}-${govCn[2]}-${govCn[3]}`;

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

/** Parse listing/index dates: "2026/05/31" or "May 27, 2026". */
export function parseListingDate(text) {
  const s = String(text ?? '').trim();
  if (!s) return null;

  const slash = s.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (slash) return `${slash[1]}-${slash[2]}-${slash[3]}`;

  const named = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/);
  if (named) {
    const mm = MONTHS[named[1].toLowerCase()];
    if (!mm) return null;
    return `${named[3]}-${mm}-${named[2].padStart(2, '0')}`;
  }

  return null;
}

/** ISO datetime or YYYY-MM-DD from HTML time[datetime]. */
export function dateFromDatetime(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
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
