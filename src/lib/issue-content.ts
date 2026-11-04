import { getCollection, type CollectionEntry } from "astro:content";
import { currentIssueMonday, issueDateForArticle, issueSlug, toUtcDateOnly } from "./issues";

export type Article = CollectionEntry<"articles">;

export async function allPublished(): Promise<Article[]> {
  return (await getCollection("articles")).filter((a) => a.data.status === "published");
}

export function articleIssue(article: Article): Date {
  return issueDateForArticle(article.data.date, article.data.issue ?? null);
}

export function groupByIssue(articles: Article[]): Map<string, { date: Date; articles: Article[] }> {
  const map = new Map<string, { date: Date; articles: Article[] }>();
  for (const article of articles) {
    const date = articleIssue(article);
    const key = issueSlug(date);
    const row = map.get(key);
    if (row) row.articles.push(article);
    else map.set(key, { date, articles: [article] });
  }
  return map;
}

export function splitIssue(articles: Article[]) {
  const stories = articles
    .filter((a) => a.data.desk !== "blotter" && a.data.desk !== "calendar")
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
  const events = articles
    .filter((a) => a.data.desk === "calendar")
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id));
  const arrests = articles
    .filter((a) => a.data.desk === "blotter")
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id));
  return { stories, events, arrests };
}

export function eventsInWindow(articles: Article[], issue: Date, weeks = 6): Article[] {
  const start = toUtcDateOnly(issue);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + weeks * 7);
  return articles
    .filter((a) => a.data.desk === "calendar")
    .filter((a) => {
      const d = toUtcDateOnly(a.data.date);
      return d.valueOf() >= start.valueOf() && d.valueOf() < end.valueOf();
    })
    .sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf() || a.id.localeCompare(b.id));
}

/** The issue the front page shows: this week's, by the Chicago calendar.
 *  A story dated in a future week must not make next week's issue the front page.
 *  If this week has nothing filed yet, show the newest earlier issue.
 *  Only if every issue is in the future does it fall back to the oldest of them. */
export function latestIssueDate(articles: Article[], now: Date = new Date()): Date | null {
  const groups = groupByIssue(articles);
  if (groups.size === 0) return null;
  const current = currentIssueMonday(now).valueOf();
  const ranked = [...groups.values()].sort((a, b) => b.date.valueOf() - a.date.valueOf());
  const upToNow = ranked.filter((g) => g.date.valueOf() <= current);
  if (upToNow.length > 0) return upToNow[0].date;
  return ranked[ranked.length - 1].date;
}

export function sameIssueDay(a: Date, b: Date): boolean {
  return toUtcDateOnly(a).valueOf() === toUtcDateOnly(b).valueOf();
}
