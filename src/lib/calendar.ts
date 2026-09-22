/** Meetings calendar. Explicit `upcoming` wins. A dated sentence is the fallback. */

export type Upcoming = { when: string; what: string; where: string; url: string };

export type CalendarArticle = {
  id: string;
  body?: string;
  data: {
    title: string;
    status: string;
    desk: string;
    city: string;
    bodies: string[];
    sources: { url: string; label: string }[];
    upcoming?: Upcoming[];
  };
};

export type MeetingItem = {
  year: number;
  month: number;
  day: number;
  time: string;
  what: string;
  where: string;
  url: string;
  articleId: string;
  articleTitle: string;
};

const CALENDAR_DESKS = new Set(["meetings", "schools", "land"]);

const MONTHS: Record<string, number> = {
  january: 1,
  jan: 1,
  february: 2,
  feb: 2,
  march: 3,
  mar: 3,
  april: 4,
  apr: 4,
  may: 5,
  june: 6,
  jun: 6,
  july: 7,
  jul: 7,
  august: 8,
  aug: 8,
  september: 9,
  sept: 9,
  sep: 9,
  october: 10,
  oct: 10,
  november: 11,
  nov: 11,
  december: 12,
  dec: 12,
};

export function chicagoToday(now = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const num = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
  return { year: num("year"), month: num("month"), day: num("day") };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function parseWhen(when: string): { year: number; month: number; day: number; time: string } | null {
  const match = when.trim().match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T]+(.+))?$/);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return { year, month, day, time: (match[4] ?? "").replace(/\s+/g, " ").trim() };
}

export function chooseMonth(
  items: { year: number; month: number; day: number }[],
  today: { year: number; month: number; day: number },
): { year: number; month: number } {
  if (items.some((item) => item.year === today.year && item.month === today.month)) {
    return { year: today.year, month: today.month };
  }
  const todayKey = today.year * 10000 + today.month * 100 + today.day;
  const upcoming = items
    .map((item) => ({ ...item, key: item.year * 10000 + item.month * 100 + item.day }))
    .filter((item) => item.key >= todayKey)
    .sort((a, b) => a.key - b.key);
  if (upcoming.length === 0) return { year: today.year, month: today.month };
  return { year: upcoming[0].year, month: upcoming[0].month };
}

function timeKey(time: string): number {
  const match = time.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(a\.m\.|p\.m\.)?$/i);
  if (!match) return 24 * 60 + 1;
  let hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  const suffix = (match[3] ?? "").toLowerCase();
  if (suffix.startsWith("p") && hour < 12) hour += 12;
  if (suffix.startsWith("a") && hour === 12) hour = 0;
  return hour * 60 + minute;
}

function whereAfter(text: string, city: string): string {
  const match = text.match(/^\s*,?\s*(?:in|at)\s+(?:the\s+)?([^.]{3,90})/i);
  if (!match) return city;
  return match[1].replace(/\s+/g, " ").replace(/[,;:\s]+$/, "").trim() || city;
}

function fromBody(article: CalendarArticle): MeetingItem[] {
  const body = article.body ?? "";
  const re =
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+([A-Za-z]+)\.?\s+(\d{1,2}),?\s+(\d{4})(?:,|\s)+(?:at\s+)?(\d{1,2}(?::\d{2})?\s*(?:a\.m\.|p\.m\.))?/gi;
  const found: MeetingItem[] = [];
  const seen = new Set<string>();
  for (const match of body.matchAll(re)) {
    const month = MONTHS[match[1].toLowerCase()];
    const day = Number(match[2]);
    const year = Number(match[3]);
    if (!month || day < 1 || day > daysInMonth(year, month)) continue;
    const time = (match[4] ?? "").replace(/\s+/g, " ").trim();
    const key = `${year}-${month}-${day}|${time.toLowerCase()}`;
    if (seen.has(key)) continue;
    const url = article.data.sources[0]?.url;
    if (!url) continue;
    seen.add(key);
    const after = body.slice((match.index ?? 0) + match[0].length, (match.index ?? 0) + match[0].length + 160);
    found.push({
      year,
      month,
      day,
      time,
      what: article.data.bodies[0] ?? article.data.title,
      where: whereAfter(after, article.data.city),
      url,
      articleId: article.id,
      articleTitle: article.data.title,
    });
  }
  return found;
}

export function collectMeetings(articles: CalendarArticle[]): MeetingItem[] {
  const items: MeetingItem[] = [];
  const seen = new Set<string>();
  for (const article of articles) {
    if (article.data.status !== "published" || !CALENDAR_DESKS.has(article.data.desk)) continue;
    const parsed: MeetingItem[] = [];
    if (article.data.upcoming && article.data.upcoming.length > 0) {
      for (const entry of article.data.upcoming) {
        const when = parseWhen(entry.when);
        if (!when || !entry.url) continue;
        parsed.push({
          ...when,
          what: entry.what,
          where: entry.where,
          url: entry.url,
          articleId: article.id,
          articleTitle: article.data.title,
        });
      }
    } else if (!article.data.upcoming) {
      parsed.push(...fromBody(article));
    }
    for (const item of parsed) {
      const key = `${item.year}-${item.month}-${item.day}|${timeKey(item.time)}|${item.url}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(item);
    }
  }
  items.sort((a, b) => timeKey(a.time) - timeKey(b.time) || a.what.localeCompare(b.what));
  return items;
}
