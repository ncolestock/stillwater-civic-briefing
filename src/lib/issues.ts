/** Monday-issue helpers for New Saint Croix Union.
 *  An issue publishes each Monday. Articles without an explicit `issue`
 *  field land in the Monday on or after their dateline (the next paper). */

export function toUtcDateOnly(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Monday on or after the given UTC calendar day. */
export function mondayOnOrAfter(date: Date): Date {
  const d = toUtcDateOnly(date);
  const day = d.getUTCDay(); // 0 Sun … 6 Sat
  const add = (8 - day) % 7; // Mon→0, Sun→1, Tue→6 …
  d.setUTCDate(d.getUTCDate() + add);
  return d;
}

export function issueDateForArticle(date: Date, explicit?: Date | null): Date {
  if (explicit) return toUtcDateOnly(explicit);
  return mondayOnOrAfter(date);
}

export function issueSlug(date: Date): string {
  const d = toUtcDateOnly(date);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseIssueSlug(slug: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(slug);
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (Number.isNaN(d.valueOf())) return null;
  if (d.getUTCDay() !== 1) return null; // issues are Mondays only
  return d;
}

/** Display title for a weekly issue (Monday of that week). */
export function formatIssueLabel(date: Date): string {
  const day = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Week of ${day}`;
}

/** ISO week number for a UTC calendar day (Mon–Sun weeks). */
export function isoWeekNumber(date: Date): number {
  const d = toUtcDateOnly(date);
  // Thursday of this week determines the ISO week-year
  const day = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.valueOf() - yearStart.valueOf()) / 86400000) + 1) / 7);
}

/** Header line: Issue 38 · September 21–27, 2026 */
export function formatIssueHeader(monday: Date): string {
  const start = toUtcDateOnly(monday);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 6);
  const week = isoWeekNumber(start);
  const sameMonth = start.getUTCMonth() === end.getUTCMonth();
  const startLabel = start.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const endLabel = end.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
  return `Issue ${week} · ${startLabel}–${endLabel}`;
}

export function articleAnchor(id: string): string {
  return `a-${id}`;
}
