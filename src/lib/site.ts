export const DISCLAIMER =
  "Researched and written by AI from public records. Not a substitute for the official record. Charges are allegations, not convictions. Verify against the source links.";

export const DESKS = {
  meetings: { label: "Meetings", path: "meetings" },
  schools: { label: "Schools", path: "schools" },
  land: { label: "Land", path: "land" },
  roads: { label: "Roads", path: "roads" },
  blotter: { label: "Blotter", path: "blotter" },
  calendar: { label: "Calendar", path: "calendar" },
} as const;

export type DeskId = keyof typeof DESKS;

export const NAV: DeskId[] = ["meetings", "schools", "land", "blotter", "calendar"];

export function deskNav(hasPublishedRoads: boolean): DeskId[] {
  if (!hasPublishedRoads) return NAV;
  return ["meetings", "schools", "land", "roads", "blotter", "calendar"];
}

/** First prose paragraph, markdown stripped. Used for decks and meta descriptions. */
export function plainFirstParagraph(body: string | undefined, max = 480): string {
  if (!body) return "";
  const blocks = body.replace(/\r\n/g, "\n").split(/\n\s*\n/);
  for (const block of blocks) {
    let trimmed = block.trim();
    if (!trimmed || trimmed.startsWith("#") || trimmed === "---") continue;
    trimmed = trimmed
      .replace(/!\[[^\]]*]\([^)]*\)/g, "")
      .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
      .replace(/[*_~`>]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!trimmed) continue;
    if (trimmed.length <= max) return trimmed;
    const slice = trimmed.slice(0, max);
    const sentence = Math.max(slice.lastIndexOf(". "), slice.lastIndexOf("! "), slice.lastIndexOf("? "));
    if (sentence > 80) return slice.slice(0, sentence + 1).trim();
    const word = slice.lastIndexOf(" ");
    return `${(word > 80 ? slice.slice(0, word) : slice).trimEnd()}…`;
  }
  return "";
}

export function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const clean = path.replace(/^\//, "");
  return `${base}${clean}`;
}

export function formatDateline(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
