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

export function formatIssueLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function articleAnchor(id: string): string {
  return `a-${id}`;
}
