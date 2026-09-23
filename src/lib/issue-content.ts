import { getCollection, type CollectionEntry } from "astro:content";
import { issueDateForArticle, issueSlug, toUtcDateOnly } from "./issues";

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

export function latestIssueDate(articles: Article[]): Date | null {
  const groups = groupByIssue(articles);
  if (groups.size === 0) return null;
  const ranked = [...groups.values()].sort((a, b) => b.date.valueOf() - a.date.valueOf());
  // Prefer the newest Monday that carries news stories, not only a future calendar item.
  const withStories = ranked.find((g) =>
    g.articles.some((a) => a.data.desk !== "blotter" && a.data.desk !== "calendar"),
  );
  return (withStories ?? ranked[0]).date;
}

export function sameIssueDay(a: Date, b: Date): boolean {
  return toUtcDateOnly(a).valueOf() === toUtcDateOnly(b).valueOf();
}
